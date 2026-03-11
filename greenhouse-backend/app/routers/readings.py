import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.alert_engine import check_thresholds
from app.database import get_db
from app.models import Reading
from app.schemas import ReadingCreate, ReadingResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/readings", tags=["readings"])


@router.post(
    "",
    response_model=ReadingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_reading(reading: ReadingCreate, db: Session = Depends(get_db)):
    """Create a new sensor reading.

    Accepts temperature (°F, -40–150) and humidity (%, 0–100).
    The reading is stored with the current UTC timestamp.
    """
    db_reading = Reading(
        temperature=reading.temperature,
        humidity=reading.humidity,
    )
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)

    # Check thresholds and fire alerts (failures here must not affect the 201 response)
    try:
        alerts = check_thresholds(db, db_reading)
        if alerts:
            logger.info("Triggered %d alert(s) for reading %d", len(alerts), db_reading.id)
    except Exception:
        logger.exception("Alert engine error for reading %d", db_reading.id)

    return db_reading


@router.get("", response_model=list[ReadingResponse])
def list_readings(
    hours: int | None = Query(None, ge=1, description="Filter to readings from the last N hours"),
    db: Session = Depends(get_db),
):
    """Return readings, newest first.

    Optionally pass `?hours=N` to only include readings from the last N hours.
    Results are capped at 1 000 rows.
    """
    query = db.query(Reading)
    if hours is not None:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        query = query.filter(Reading.timestamp >= cutoff)
    return query.order_by(Reading.timestamp.desc()).limit(1000).all()


@router.get("/latest", response_model=ReadingResponse)
def latest_reading(db: Session = Depends(get_db)):
    """Return the single most recent reading.

    Returns 404 if no readings exist yet.
    """
    reading = db.query(Reading).order_by(Reading.timestamp.desc()).first()
    if reading is None:
        raise HTTPException(status_code=404, detail="No readings found")
    return reading
