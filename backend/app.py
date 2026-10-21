from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models.user import User
from models.ticket import Ticket
from utils.auth import get_current_user, require_roles

from routes.auth import router as auth_route
from routes.tickets import router as ticket_route
from routes.users import router as users
from routes.ticket_message import router as ticket_message


app = FastAPI(title="Helpdesk Ticket Management System",
              swagger_ui_parameters={
                  "persistAuthorization": True
              })


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# routes
app.include_router(auth_route)
app.include_router(ticket_route)
app.include_router(users)
app.include_router(ticket_message)

@app.get("/")
def root():
    return({
        "messgae":"wellcome ticket management system"
    })

@app.get("/health")
def check_health():
    return {"status": "ok"}

@app.get("/api/v1/users/me")
async def get_my_profile(
    current_user : User=Depends(get_current_user)
):
    
    return{
        "id": str(current_user.id),
        "name":str(current_user.name),
        "email": str(current_user.email),
        "role": str(current_user.role),
        "is_active":str(current_user.is_active)
    }

@app.get("/api/v1/admin/test")
def admin_test(
    current_user :User = Depends(require_roles("admin"))
):
    return {"message":"Wellcome , Admin"}