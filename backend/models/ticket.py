import uuid

from sqlalchemy import Column, Integer, String, Text, DateTime,ForeignKey, CheckConstraint, func, Uuid
from sqlalchemy.orm import relationship

from database import Base

class Ticket(Base):

    __tablename__ = "tickets"

    __table_args__ =(
        CheckConstraint(
            "category IN('Technica', 'Billing', 'Account', 'Subscription', 'Other')",
            name= "check_ticket_category",
        ),
        CheckConstraint(
            "priority IN ('Low','Medium','High','Urgent')",
            name="check_ticket_priority"
        ),
        CheckConstraint(
            "status IN ('Open', 'In Progress', 'Wating fot User', 'Resoled','Closed')",
            name="check_ticket_status"
        ),
          )

    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    category = Column(String(30), nullable=False, default="Other")
    priority = Column(String(20), nullable=False, default="Medium")
    status = Column(String(30), nullable=False, default="Open")
    created_by = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"),nullable=False, index=True)
    assigned_to = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=True,
        index=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # relation with user model  
    creator = relationship(
        "User",
        foreign_keys=[created_by]
    )
 
    assigned_agent = relationship(
        "User",
        foreign_keys=[assigned_to]
    )

