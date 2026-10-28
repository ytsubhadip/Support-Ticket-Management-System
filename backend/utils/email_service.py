import os 
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()




def send_email(to_email: str, subject: str, body: str):
    smtp_email = os.getenv("EMAIL")
    smtp_password = os.getenv("EMAIL_PASSWORD")
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    if not smtp_email or not smtp_password:
        raise ValueError("SMTP_EMAIL or SMTP_PASSWORD is missing in .env")

    msg= EmailMessage()
    msg["Subject"] = subject
    msg["From"] = smtp_email
    msg["To"] = to_email
    msg.set_content(body)

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.send_message(msg)
        
