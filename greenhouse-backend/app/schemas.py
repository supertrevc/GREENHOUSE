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


class SettingsResponse(BaseModel):
    """Response model for threshold settings."""

    id: int
    min_temperature: float
    max_temperature: float | None
    min_humidity: float | None
    max_humidity: float | None
    alert_cooldown_minutes: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class SettingsUpdate(BaseModel):
    """Request body for updating threshold settings (partial update)."""

    min_temperature: float | None = Field(None, ge=-40, le=150)
    max_temperature: float | None = Field(None, ge=-40, le=150)
    min_humidity: float | None = Field(None, ge=0, le=100)
    max_humidity: float | None = Field(None, ge=0, le=100)
    alert_cooldown_minutes: int | None = Field(None, ge=1)


class AlertResponse(BaseModel):
    """Response model for an alert record."""

    id: int
    timestamp: datetime
    reading_id: int
    alert_type: str
    message: str
    notified: bool

    model_config = {"from_attributes": True}
