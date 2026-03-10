import time
from datetime import datetime, timezone

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import Reading
from app.routers import readings
from app.schemas import StatusResponse

Base.metadata.create_all(bind=engine)

_start_time = time.time()

app = FastAPI(
    title="Greenhouse Monitoring API",
    description="Backend API for receiving, storing, and serving temperature and humidity sensor readings.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(readings.router)


@app.get("/api/status", response_model=StatusResponse)
def status(db: Session = Depends(get_db)):
    """Health-check endpoint.

    Returns server uptime, the timestamp of the most recent reading,
    and the total number of readings stored in the database.
    """
    latest = db.query(Reading).order_by(Reading.timestamp.desc()).first()
    total = db.query(func.count(Reading.id)).scalar()
    return StatusResponse(
        status="ok",
        server_uptime_seconds=round(time.time() - _start_time, 2),
        last_reading_at=latest.timestamp if latest else None,
        total_readings=total,
    )
