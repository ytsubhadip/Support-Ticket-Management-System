import uuid
import os

from worker.celery_app import celery_app
from database import SessionLocal
from models.notification import Notification
from models.ticket import Ticket
from utils.email_service import send_email
from dotenv import load_dotenv
from models.user import User

load_dotenv()

@celery_app.task
def create_ticket_notification(
    ticket_id: str, 
    recipient_id: str,
    user_email: str,
    ticket_title: str
):
    admin_email = os.getenv("ADMIN_EMAIL")

    if not admin_email:
        raise ValueError("Admin is not find")

    db = SessionLocal()

    try:
        # Find admin user in the database
        admin = (
            db.query(User)
            .filter(
               User.email == admin_email
            )
            .first()
        )   

        if not admin:
            raise ValueError(
                f"No admin user found with email {admin_email}"
            )

        # save user notification
        user_notification = Notification(
            recipient_id=uuid.UUID(recipient_id),
            ticket_id=uuid.UUID(ticket_id),
            type="ticket_created",
            title="Ticket Create Successfully",
            message=(
                f"Your ticket '{ticket_title}' was created successfully. "
                f"Ticket ID: {ticket_id}"),
            is_read=False,
        )

        # save admin notification
        admin_notification = Notification(
            recipient_id = admin.id,
            ticket_id = uuid.UUID(ticket_id),
            type = "ticket_created",
            title = "New Ticket - Agent Assignment Required",
            message = (
                  f"A new ticket '{ticket_title}' has been created. "
                f"Ticket ID: {ticket_id}. "
                "Please assign a support agent."
            ),
             is_read=False
        )

        db.add_all([user_notification, admin_notification])
        db.commit()


    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

        # send email to the user
    send_email(
            to_email=user_email,
            subject=f"Ticket Creared {ticket_id}",
            body=(
                 "Hello,\n\n"
                "Your support ticket has been created successfully.\n\n"
                 f"Ticket ID: {ticket_id}\n"
                f"Title: {ticket_title}\n\n"
                    "Our support team will review your request."
            ),
        )

        # send email to admin
    send_email(
            to_email=admin_email,
            subject=f"New Ticket: {ticket_id} - Assign an Agent",
            body=(
                  "Hello Admin,\n\n"
            "A new support ticket has been created.\n\n"
            f"Ticket ID: {ticket_id}\n"
            f"Title: {ticket_title}\n"
            f"Created by: {user_email}\n\n"
            "Please log in to the Support Ticket Management System "
            "and assign a support agent."
            )
        )

    return f"Notifications saved and emails sent for ticket {ticket_id}"
        