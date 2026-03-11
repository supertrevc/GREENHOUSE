"""Alert engine — threshold checking, cooldown logic, and FCM push notifications."""

import logging
import os
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models import Alert, Reading, Settings

logger = logging.getLogger(__name__)

# Firebase initialization (lazy, once)
_firebase_app = None
_firebase_init_attempted = False


def _init_firebase():
    """Initialize Firebase Admin SDK if credentials are available."""
    global _firebase_app, _firebase_init_attempted
    if _firebase_init_attempted:
        return _firebase_app
    _firebase_init_attempted = True

    creds_path = os.environ.get("FIREBASE_CREDENTIALS_PATH")
    if not creds_path:
        logger.warning("FIREBASE_CREDENTIALS_PATH not set — push notifications disabled")
        return None

    if not os.path.isfile(creds_path):
        logger.warning("Firebase credentials file not found at %s — push notifications disabled", creds_path)
        return None

    try:
        import firebase_admin
        from firebase_admin import credentials

        cred = credentials.Certificate(creds_path)
        _firebase_app = firebase_admin.initialize_app(cred)
        logger.info("Firebase initialized successfully")
        return _firebase_app
    except Exception:
        logger.exception("Failed to initialize Firebase")
        return None


def _send_push_notification(title: str, body: str) -> bool:
    """Send a push notification via FCM to the greenhouse-alerts topic.

    Returns True if sent successfully, False otherwise.
    """
    app = _init_firebase()
    if app is None:
        return False

    try:
        from firebase_admin import messaging

        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            topic="greenhouse-alerts",
        )
        messaging.send(message)
        logger.info("Push notification sent: %s", body)
        return True
    except Exception:
        logger.exception("Failed to send push notification")
        return False


def _get_or_create_settings(db: Session) -> Settings:
    """Return the settings row, creating it with defaults if it doesn't exist."""
    settings = db.query(Settings).first()
    if settings is None:
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def _cooldown_active(db: Session, alert_type: str, cooldown_minutes: int) -> bool:
    """Check if an alert of the given type was created within the cooldown window."""
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=cooldown_minutes)
    recent = (
        db.query(Alert)
        .filter(Alert.alert_type == alert_type, Alert.timestamp >= cutoff)
        .first()
    )
    return recent is not None


def check_thresholds(db: Session, reading: Reading) -> list[Alert]:
    """Check a reading against all configured thresholds.

    Creates alert records and sends notifications for any breaches
    where the cooldown period has elapsed. Returns the list of new alerts.
    """
    settings = _get_or_create_settings(db)
    new_alerts: list[Alert] = []

    checks = [
        (
            settings.min_temperature is not None and reading.temperature < settings.min_temperature,
            "low_temperature",
            f"Temperature dropped to {reading.temperature}°F, below minimum of {settings.min_temperature}°F",
        ),
        (
            settings.max_temperature is not None and reading.temperature > settings.max_temperature,
            "high_temperature",
            f"Temperature rose to {reading.temperature}°F, above maximum of {settings.max_temperature}°F",
        ),
        (
            settings.min_humidity is not None and reading.humidity < settings.min_humidity,
            "low_humidity",
            f"Humidity dropped to {reading.humidity}%, below minimum of {settings.min_humidity}%",
        ),
        (
            settings.max_humidity is not None and reading.humidity > settings.max_humidity,
            "high_humidity",
            f"Humidity rose to {reading.humidity}%, above maximum of {settings.max_humidity}%",
        ),
    ]

    for breached, alert_type, message in checks:
        if not breached:
            continue
        if _cooldown_active(db, alert_type, settings.alert_cooldown_minutes):
            continue

        notified = _send_push_notification("Greenhouse Alert", message)
        alert = Alert(
            reading_id=reading.id,
            alert_type=alert_type,
            message=message,
            notified=notified,
        )
        db.add(alert)
        new_alerts.append(alert)

    if new_alerts:
        db.commit()
        for a in new_alerts:
            db.refresh(a)

    return new_alerts
