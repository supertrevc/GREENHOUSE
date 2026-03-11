from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Alert
from app.schemas import AlertResponse

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertResponse])
def list_alerts(
    hours: int | None = Query(None, ge=1, description="Filter to alerts from the last N hours"),
    db: Session = Depends(get_db),
):
    """Return alert history, newest first.

    Optionally pass `?hours=N` to filter to recent alerts.
    Limited to 100 results by default.
    """
    query = db.query(Alert)
    if hours is not None:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        query = query.filter(Alert.timestamp >= cutoff)
    return query.order_by(Alert.timestamp.desc()).limit(100).all()
