import uuid
from sqlalchemy import Column, String, Integer, ForeignKey,Text, Boolean, DateTime, Uuid
from datetime import datetime
from database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipient_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    ticket_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("tickets.id"),
        nullable=False,
        index=True
    )
    type = Column(
        String(50),
        nullable=False
    )
    title = Column(
        String(255),nullable=False
    )
    message = Column(Text, nullable=False)
    is_read =Column(Boolean, default=False, nullable=False)
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )