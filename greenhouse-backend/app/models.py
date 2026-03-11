from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String

from app.database import Base


class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, default=1)
    min_temperature = Column(Float, default=35, nullable=False)
    max_temperature = Column(Float, nullable=True, default=None)
    min_humidity = Column(Float, nullable=True, default=None)
    max_humidity = Column(Float, nullable=True, default=None)
    alert_cooldown_minutes = Column(Integer, default=30, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    reading_id = Column(Integer, ForeignKey("readings.id"), nullable=False)
    alert_type = Column(String, nullable=False)
    message = Column(String, nullable=False)
    notified = Column(Boolean, default=False, nullable=False)
