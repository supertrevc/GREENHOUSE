from datetime import datetime

from pydantic import BaseModel, Field


class ReadingCreate(BaseModel):
    """Request body for posting a new sensor reading."""

    temperature: float = Field(..., ge=-40, le=150, description="Temperature in °F (-40 to 150)")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity in % (0 to 100)")


class ReadingResponse(BaseModel):
    """Response model for a sensor reading."""

    id: int
    timestamp: datetime
    temperature: float
    humidity: float

    model_config = {"from_attributes": True}


class StatusResponse(BaseModel):
    """Response model for the health-check endpoint."""

    status: str
    server_uptime_seconds: float
    last_reading_at: datetime | None
    total_readings: int
