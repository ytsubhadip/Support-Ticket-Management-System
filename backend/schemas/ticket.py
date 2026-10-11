from datetime import datetime
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


TicketCategory = Literal[
    "Technica",
    "Billing",
    "Account",
    "Subscription",
    "Other"
]

TicketPriority = Literal[
    "Low",
    "Medium",
    "High",
    "Urgent"
]

TicketStatus = Literal[
    "Open",
    "In Process",
    "Waiting for User",
    "Resolved",
    "Closed"
]

class TicketCreate(BaseModel):
    title : str = Field(min_length=3, max_length=200)
    description : str = Field(min_length=5, max_length=10000)
    category :TicketCategory = "Other"
    priority : TicketPriority = "Medium"



class TicketResponse(BaseModel):
    id: UUID
    title: str
    description : str
    category :str
    priority : str
    status: str
    created_by : UUID
    assigned_to : UUID | None
    created_at : datetime
    updated_at : datetime

class TicketUpdate(BaseModel):
    title : str| None=Field(default=None, min_length=3, max_length=200)
    description : str |None = Field(default=None, min_length=5, max_length=10000)
    category : TicketCategory |None= None
    priority : TicketPriority |None= None

class TicketStatusUpdate(BaseModel):
    status : TicketStatus