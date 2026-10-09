from fastapi import FastAPI, HTTPException
from database import engine, Base
from models.user import User

from routes.auth import router as auth_route


app = FastAPI(title="Helpdesk Ticket Management System")
Base.metadata.create_all(bind=engine)

# routes
app.include_router(auth_route)

@app.get("/health")
def check_health():
    return {"status": "ok"}