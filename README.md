# Support Ticket Management System

A full-stack help desk and ticketing platform built with FastAPI on the backend and React on the frontend. The project is designed for a support workflow where users raise issues, support agents resolve assigned tickets, and administrators manage users, tickets, notifications, and overall platform operations.

## Overview

This application includes:

- User registration and login
- JWT-based authentication
- Role-based access control for users, support agents, and admins
- Ticket creation, viewing, filtering, and assignment
- Ticket status updates and message history
- File attachments for tickets
- In-app notifications and email alerts
- Admin controls for user role and status management
- Background job processing using Celery and Redis
- Docker Compose setup for running the whole stack

## Roles

### User
- Create and manage their own support tickets
- View ticket history and ticket conversations
- Receive updates and notifications
- Upload attachments to tickets

### Support Agent
- View assigned tickets
- Update ticket status and respond to ticket messages
- Resolve or escalate tickets assigned to them

### Admin
- View all users and tickets
- Assign support agents to tickets
- Manage user roles and account status
- Monitor platform activity and support workflows

## Technology Stack

### Backend
- Python 3.11+
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- JWT authentication
- Celery
- Redis
- Uvicorn

### Frontend
- React
- Vite
- React Router
- Axios
- CSS Modules / custom CSS

### Infrastructure
- Docker
- Docker Compose
- Nginx (frontend container)

## Project Structure

```text
Support-Ticket-Management-System/
├── .env
├── README.md
├── docker-compose.yml
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── requirements.txt
│   ├── models/
│   │   ├── audit_log.py
│   │   ├── notification.py
│   │   ├── ticket.py
│   │   └── user.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── notification.py
│   │   ├── ticket_message.py
│   │   ├── tickets.py
│   │   └── users.py
│   ├── schemas/
│   │   ├── notification.py
│   │   ├── ticket.py
│   │   └── user.py
│   ├── services/
│   ├── utils/
│   │   ├── auth.py
│   │   ├── audit_logger.py
│   │   ├── email_service.py
│   │   ├── rate_limiter.py
│   │   └── security.py
│   ├── worker/
│   │   ├── __init__.py
│   │   ├── celery_app.py
│   │   └── tasks.py
│   └── uploads/
│       └── tickets/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── nginx.conf
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── assets/
│       ├── components/
│       ├── pages/
│       └── services/
└── docker-compose.yml
```

## Core Features

### Authentication and Access Control
- Register and log in users
- Generate JWT access tokens
- Restrict endpoints by role
- Prevent inactive users from accessing protected routes

### Ticket Management
- Create tickets with title, description, category, priority, and status
- View tickets by role and access permissions
- Filter by category, priority, and status
- Assign tickets to support agents
- Update ticket state as work progresses

### Conversations and Communication
- Ticket comments/messages
- Support-agent replies and user dialogue flow
- Notification generation for ticket events
- Optional email notifications for ticket creation and assignment

### Admin Operations
- List users
- Activate/deactivate users
- Update user roles
- Assign support agents to new or existing tickets
- Review administrative workflows

### Background Processing
- Redis-backed task queue
- Celery workers for notification and email jobs
- Non-blocking asynchronous updates for support communication

## Default Application Ports

- Frontend (React/Vite dev): http://localhost:5173
- Frontend (Docker): http://localhost:3000
- Backend API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Prerequisites

Before running the project locally, install:

- Python 3.11+
- Node.js 18+
- npm
- PostgreSQL
- Redis
- Git

## Environment Setup

Create a root `.env` file for the project and configure the required values:

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=helpdesk_db

# Backend
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/helpdesk_db
SECRET_KEY=replace_with_a_secure_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/1

# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL=your_email@example.com
EMAIL_PASSWORD=your_email_app_password
ADMIN_EMAIL=admin@example.com

# Frontend
VITE_API_URL=http://localhost:8000/api/v1
```

Notes:
- Do not commit real secrets to the repository.
- The backend reads values from this `.env` file during startup.
- For Gmail, use an app password if 2FA is enabled.

## Local Development Setup

### 1) Clone the repository

```bash
git clone https://github.com/ytsubhadip/Support-Ticket-Management-System.git
cd Support-Ticket-Management-System
```

### 2) Backend setup

```bash
cd backend
python -m venv .venv
```

On Windows:

```powershell
.venv\Scripts\activate
```

On Linux/macOS:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 3) Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

## Running with Docker Compose

From the project root, run:

```bash
docker compose up -d --build
```

This starts:

- PostgreSQL database
- Redis cache
- FastAPI backend
- Celery worker
- React frontend

Check the running services:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Stop the stack:

```bash
docker compose down
```

To remove volumes as well:

```bash
docker compose down -v
```

## API Overview

The backend exposes REST APIs under the `/api/v1` prefix.

### Authentication
```http
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Users
```http
GET /api/v1/users/
GET /api/v1/users/support-agents
PATCH /api/v1/users/{user_id}/status
PATCH /api/v1/users/{user_id}/role
```

### Tickets
```http
GET /api/v1/tickets/
POST /api/v1/tickets/
GET /api/v1/tickets/{ticket_id}
PATCH /api/v1/tickets/{ticket_id}
PATCH /api/v1/tickets/{ticket_id}/status
GET /api/v1/tickets/assigned
```

### Notifications
```http
GET /api/v1/notifications/
```

### API Docs
```text
http://localhost:8000/docs
http://localhost:8000/redoc
```

## Example Workflow

```text
1. User registers and logs in
2. User creates a support ticket
3. Admin reviews the ticket and assigns a support agent
4. Support agent receives the assignment and updates the ticket
5. User and agent continue the conversation through ticket messages
6. Agent resolves the issue and updates the ticket status
7. Notification emails and in-app alerts are triggered automatically
```

## Notes

- The backend uses SQLAlchemy models and PostgreSQL by default.
- Background work such as email and notification generation is handled by Celery with Redis.
- The frontend is a React-based portal with role-protected pages for different user types.
- The application is intended for local development and container-based deployment, with additional production hardening recommended before public deployment.

## License

This project is currently distributed without a formal license declaration in the repository. If you plan to share or publish it externally, add an appropriate license file before distribution.

## Support

For setup issues, backend problems, or environment variable questions, check the project files and the generated Swagger docs at `/docs` once the backend is running.
