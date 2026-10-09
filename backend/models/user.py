from sqlalchemy import Column, Integer, String, Boolean, DateTime, CheckConstraint, func, Uuid
from database import Base
import uuid

class User(Base):

    __tablename__ = "users"
    __table_args__=(
        CheckConstraint(
            "role IN ('user', 'support_agent', 'admin')",
            name="check_user_role"
        ),
    )

    id = Column(Uuid(as_uuid=True), primary_key=True, default= uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="user")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default= func.now(),
        nullable=False
    )