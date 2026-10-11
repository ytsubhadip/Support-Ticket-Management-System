from uuid import UUID
from typing import Literal

from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.ticket import Ticket

from schemas.ticket import TicketCreate, TicketResponse, TicketUpdate, TicketStatusUpdate

from utils.auth import get_current_user, require_roles

router = APIRouter(
    prefix="/api/v1/tickets",
    tags=["Tickets"]
)

# Check whether the current user can access a ticket.
def get_accessible_ticket(
        ticket_id:UUID,
        current_user: User,
        db:Session
) -> Ticket:

    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )
    is_admin = bool(current_user.role == "admin")
    is_creator = bool(ticket.created_by == current_user.id)
    is_assigned_agent = bool(
        current_user.role == "support_agent"
        and ticket.assigned_to == current_user.id
    )

    if not (is_admin or is_creator or is_assigned_agent):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this ticket",
        )

    return ticket

# create a ticket
@router.post("/")
async def create_ticket(
    ticket_data : TicketCreate,
    db : Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
):
    ticket = Ticket(
        title = ticket_data.title,
        description = ticket_data.description,
        category = ticket_data.category,
        priority = ticket_data.priority,
        status = "Open",
        created_by = current_user.id
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket

# show all available ticket 
@router.get("/",
            response_model=list[TicketResponse]
            )
async def list_tickets(
    serch : str |None = Query(default=None, max_length=200),
    category : Literal[
        "Technica", "Billing", "Account", "Subscription","Other"]| None =None,
    priority : Literal["Low", "Medium","High","Urgent"]| None = None,
    ticket_status : Literal[
        "Open", "In Process","Waiting for User", "Resolved", "Closed"] |None =Query(default=None, alias="status"),
    limit:int =Query(default=20, ge=1, le=100),
    offset : int =Query(default=0, ge=0),
    db :Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
):
    query = db.query(Ticket)

    if str(current_user.role) == "user":
        query = query.filter(Ticket.created_by == current_user.id)

    elif str(current_user.role) == "support_agent":
        query = query.filter(Ticket.assigned_to == current_user.id)
    # Admin see all the tickets

    if serch:
        serch_term = f"%{serch.strip()}%"
        query = query.filter(
            or_(
                Ticket.title.ilike(serch_term),
                Ticket.description.ilike(serch_term)
            )
        )

    if category:
        query = query.filter(Ticket.category == category)

    if priority:
         query = query.filter(Ticket.priority == priority) 

    if ticket_status:
        query = query.filter(Ticket.status == ticket_status)

    return(
        query.order_by(Ticket.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


# get one ticket
@router.get(
        "/{ticket_id}",
        response_model=TicketResponse
        )
async def get_ticket(
    ticket_id : UUID,
    db : Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
):
    return get_accessible_ticket(ticket_id,current_user, db)


# update ticket details
@router.patch(
    "/{ticket_id}",
    response_model=TicketResponse
)
async def update_ticket(
    ticket_id : UUID,
    tickeet_date : TicketUpdate,
    db : Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
):

    ticket = get_accessible_ticket(ticket_id, current_user, db)

    is_creator = bool(ticket.created_by == current_user.id)
    is_admin = bool(current_user.role == "admin")

    if (is_creator or is_admin):
        raise HTTPException(
            status_code=403,
            detail="Only the ticket creator or admin edit the thicket details"
        )

    if (str(ticket.status) != "Open"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only open thick will edit"
        )
    updates = tickeet_date.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields for provided for update"
        )
    # Explicit nulls are not valid for these non-nullable columns
    if any(value is None for value in updates.values()):
        raise HTTPException(
            status_code= status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Ticket fiels cannot be null"
        )

    for field , value in updates.items():
        setattr(ticket, field, value)

    db.commit()
    db.refresh(ticket)

    return ticket


# Update ticket status
# only the assigned support agent or an admin can change status

@router.patch(
    "/{ticket_id}/status",
    response_model=TicketResponse
)
async def update_ticket_status(
    ticket_id : UUID,
    status_data: TicketStatusUpdate,
    db:Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
):

    ticket = get_accessible_ticket(ticket_id, current_user, db)

   
    is_admin = current_user.role == "admin"
    is_assigned_agent = (
        current_user.role == "support_agent"
        and ticket.assigned_to == current_user.id
    )

    if not bool((is_admin or is_assigned_agent)):
        raise HTTPException(
            status_code= status.HTTP_403_FORBIDDEN,
            detail="Only the assigned agent or an admin can change ticket status"
        )

    new_status = status_data.status

    if str(ticket.status) == "Closed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Closed tickets cannot be changed"
        )   

    if bool(ticket.status == "Resolved") and bool(new_status not in ("Resolved", "Closed")):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A resolved ticket can only close"
        )

    ticket.status = new_status
    db.commit()

    db.refresh(ticket)

    return ticket

# assign or resign a ticket to support agent - admin only
@router.patch(
    "/{ticket_id}/assign/{agent_id}",
    response_model=TicketResponse
    )
async def assign_ticket(
    ticket_id :UUID,
    agent_id: UUID,
    db : Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    agent =(
        db.query(User)
        .filter(User.id == agent_id)
        .first()
    )

    if not agent or str(agent.role) != "support_agent":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="support agent not found" 
        ) 

    if not agent.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot assign a ticket to a inactive agent"
        )

    if ticket.status == "Closed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Closed ticket cannot assigned"
        )

    ticket.assigned_to = agent.id
    db.commit()
    db.refresh(ticket)
    return ticket

# delete ticket Admin only
@router.delete(
    "/{ticket_id}",
    status_code=status.HTTP_204_NO_content
)
async def delete_Ticket(
    ticket_id : UUID,
    db:Session = Depends(get_db),
    current_user : User =Depends(require_roles("admin"))
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    db.delete(ticket)
    db.commit()

    return None