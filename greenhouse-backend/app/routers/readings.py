from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Reading
from app.schemas import ReadingCreate, ReadingResponse

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
