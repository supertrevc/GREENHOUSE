from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer

from app.database import Base


class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
