from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Settings
from app.schemas import SettingsResponse, SettingsUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _get_or_create_settings(db: Session) -> Settings:
    settings = db.query(Settings).first()
    if settings is None:
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    """Return current threshold settings, creating defaults if none exist."""
    return _get_or_create_settings(db)


@router.put("", response_model=SettingsResponse)
def update_settings(update: SettingsUpdate, db: Session = Depends(get_db)):
    """Partial update of threshold settings.

    Only fields included in the request body are updated.
    Validates that min < max when both are provided for the same metric.
    """
    settings = _get_or_create_settings(db)

    provided = update.model_dump(exclude_unset=True)
    for field, value in provided.items():
        setattr(settings, field, value)

    # Validate min < max after applying updates
    if settings.min_temperature is not None and settings.max_temperature is not None:
        if settings.min_temperature >= settings.max_temperature:
            raise HTTPException(
                status_code=422,
                detail="min_temperature must be less than max_temperature",
            )
    if settings.min_humidity is not None and settings.max_humidity is not None:
        if settings.min_humidity >= settings.max_humidity:
            raise HTTPException(
                status_code=422,
                detail="min_humidity must be less than max_humidity",
            )

    settings.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(settings)
    return settings
