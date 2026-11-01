import uuid
from sqlalchemy import (Column, String, DateTime, ForeignKey, JSON, Uuid, func)
from database import Base


class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    
    action = Column( String(100), nullable=False)

    object_type = Column(String(100), nullable=False)

    object_id = Column(String(100), nullable=False)

    old_value = Column(JSON, nullable=True)

    new_value = Column(JSON, nullable=True)

    ip_address = Column(String(45), nullable=True)

    create_at = Column(
        DateTime(timezone=True),
        server_default= func.now(),
        nullable=False    
        )