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

@celery_app.task
def send_agent_assignment_email(
    ticket_id: str,
    ticket_title: str,
    agent_id: str,
    agent_email: str,
):
    # Save an in-app notification for the assigned agent
    db = SessionLocal()

    try:
        notification = Notification(
            recipient_id=uuid.UUID(agent_id),
            ticket_id=uuid.UUID(ticket_id),
            type="ticket_assigned",
            title="New Ticket Assigned",
            message=(
                f"Ticket '{ticket_title}' has been assigned to you. "
                f"Ticket ID: {ticket_id}. "
                "Please review and respond to the ticket."
            ),
            is_read=False,
        )

        db.add(notification)
        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

    # Send assignment email
    send_email(
        to_email=agent_email,
        subject=f"New Ticket Assigned: {ticket_title}",
        body=(
            "Hello Support Agent,\n\n"
            "A support ticket has been assigned to you.\n\n"
            f"Ticket ID: {ticket_id}\n"
            f"Ticket Title: {ticket_title}\n\n"
            "Please log in to the Support Ticket Management System "
            "to review the ticket and respond to the user.\n\n"
            "Thank you."
        ),
    )

    return f"Assignment notification sent for ticket {ticket_id}"


@celery_app.task
def notify_user_agent_replied(
    ticket_id: str,
    user_id: str,
    user_email: str,
    ticket_title: str,
):
    db = SessionLocal()

    try:
        notification = Notification(
            recipient_id=uuid.UUID(user_id),
            ticket_id=uuid.UUID(ticket_id),
            type="agent_reply",
            title="Support Agent Replied",
            message=(
                f"An agent has replied to your ticket "
                f"'{ticket_title}'. Ticket ID: {ticket_id}. "
                "Please log in to view the reply."
            ),
            is_read=False,
        )

        db.add(notification)
        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

    # Email the ticket creator
    send_email(
        to_email=user_email,
        subject=f"New Reply to Your Ticket: {ticket_title}",
        body=(
            "Hello,\n\n"
            "A support agent has replied to your ticket.\n\n"
            f"Ticket ID: {ticket_id}\n"
            f"Ticket Title: {ticket_title}\n\n"
            "Please log in to your Support Ticket Management System "
            "to view the reply and continue the conversation.\n\n"
            "Thank you."
        ),
    )

    return f"User notified about agent reply on ticket {ticket_id}"
