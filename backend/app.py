from fastapi import FastAPI, HTTPException, Depends
from database import engine, Base
from models.user import User
from utils.auth import get_current_user, require_roles

from routes.auth import router as auth_route



app = FastAPI(title="Helpdesk Ticket Management System")
Base.metadata.create_all(bind=engine)

# routes
app.include_router(auth_route)

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