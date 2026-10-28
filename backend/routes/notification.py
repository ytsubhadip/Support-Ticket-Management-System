from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.notification import Notification
from schemas.notification import NotificationResponse
from utils.auth import get_current_user
from models.user import User

router = APIRouter(
    prefix="/api/v1/notifications",
    tags=["Notifications"]
)

@router.get("/")
def get_notifications(
    db: Session=Depends(get_db),
    current_user:User = Depends(get_current_user)
):

    notifications = (
        db.query(Notification)
        .filter(Notification.recipient_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    return notifications