from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: int
    recipient_id: int
    ticket_id: int | None
    type: str
    title: str
    message:str
    is_read: bool
    created_at:datetime

    model_config= ConfigDict(from_attributes=True)