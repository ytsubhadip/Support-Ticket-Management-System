from uuid import UUID
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request, Response
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse

from database import get_db
from models.ticket import Ticket, TicketMessage,TicketMessageAttachment
from models.user import User
from schemas.ticket import TicketMessageCreate, TicketMessageResponse, TicketMessageAttachmentResponse
from utils.auth import get_current_user
from services.file_storage import save_ticket_message_file
from utils.rate_limiter import limiter


router = APIRouter(
    prefix="/api/v1/tickets",
    tags=["Ticket Message"]
)

# create ticket message 
@router.post(
    "/{ticket_id}/messages",
    response_model=TicketMessageResponse
)
@limiter.limit("30/minute")
async def create_ticket_message(
    request: Request,
    response: Response,
    ticket_id:UUID,
    data:TicketMessageCreate,
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user)
):

    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    is_owner = ticket.created_by == current_user.id
    is_assigned_agent =(ticket.assigned_to == current_user.id)
    is_admin = current_user.role == "admin"

    if not(is_owner or is_assigned_agent or is_owner):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your are not autherize to reply to this ticket"
        )

    # create message
    ticket_message =TicketMessage(
            ticket_id = ticket.id,
            sender_id = current_user.id,
            sender_role = current_user.role,
            message = data.message
    )

    db.add(ticket_message)
    db.commit()
    db.refresh(ticket_message)

    return ticket_message


# get all messages 
@router.get("/{ticket_id}/messages")
async def get_all_messages(
    ticket_id:UUID,
    db:Session=Depends(get_db),
    current_user:User = Depends(get_current_user)
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tcike not found"
        )

    is_owner = ticket.created_by == current_user.id
    is_assigned_agent =(
        ticket.assigned_to == current_user.id
    )
    is_admin = current_user.role == "admin"

    if not (is_owner or is_assigned_agent or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this conversation"
        )

    message = (
        db.query(TicketMessage)
        .filter(TicketMessage.ticket_id == ticket_id)
        .order_by(TicketMessage.created_at.asc())
        .all()
    )

    return message


# upload ticket message attachment
@router.post(
    "/{ticket_id}/attachments",
    response_model=TicketMessageAttachmentResponse,
    status_code=status.HTTP_201_CREATED,   
)
async def upload_ticket_message_attachment(
    ticket_id: UUID,
    file: UploadFile =File(...),
    db: Session=Depends(get_db),
    current_user: User=Depends(get_current_user)
):
    # find the ticket
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id) 
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    # Authorization
    is_owner = ticket.created_by == current_user.id
    is_assigned_agent = (
        ticket.assigned_to == current_user.id
    )
    is_admin = current_user.role == "admin"

    if not (is_owner is True or is_assigned_agent is True or is_admin is True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this ticket"
        )
    
    # allow file types
    allowed_types = {
        "image/jpeg",
        "image/png",
        "application/pdf",
        "text/plain"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type is not allowed"
        )

    # save file
    file_path, file_size = await save_ticket_message_file(
        ticket_id=ticket_id,
        file=file
    )

    # create attachment
    attachment =  TicketMessageAttachment(
        ticket_id=ticket_id,
        filename=file.filename,
        file_path=file_path,
        mime_type=file.content_type,
        file_size=file_size
    )

    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return attachment   



# download ticket attachment
@router.get(
    "/{ticket_id}/attachments/{attachment_id}"
)
def download_ticket_attachment(
    ticket_id:UUID,
    attachment_id:UUID,
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user)
):
    ticket= (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    is_owner=ticket.created_by == current_user.id
    is_assigned_agent =(
        ticket.assigned_to == current_user.id
    )
    is_admin = current_user.role == "admin"

    if not(is_owner or is_assigned_agent or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this attachemnt"
        )

    attachment =(
        db.query(TicketMessageAttachment)
        .filter(
            TicketMessageAttachment.id == attachment_id,
        )
        .first()
    )

    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )

    file_path = Path(attachment.file_path)

    if not  file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )

    return FileResponse(
        path=file_path,
        media_type=attachment.mime_type,
        filename=attachment.filename
    )

# get all attachment list
@router.get("/{ticket_id}/attachments",
            response_model=list[TicketMessageAttachmentResponse]
            )
def get_attachments_list(
    ticket_id:UUID,
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user)
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    is_owner = ticket.created_by == current_user.id
    is_assigned_agent =(
        ticket.assigned_to == current_user.id
    )
    is_admin = current_user.role == "admin"

    if not(is_owner or is_assigned_agent or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorize to view these attachments"
        )

    attachments = (
        db.query(TicketMessageAttachment)
        .filter(
            TicketMessageAttachment.ticket_id == ticket_id
        )
        .order_by(
            TicketMessageAttachment.created_at.asc()
        )
        .all()
    )

    return attachments
    