from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse
from utils.security import hash_passowrd

router = APIRouter(prefix="/api/v1/auth", tags=["Authentiaction"])

@router.post("/register", 
             response_model=UserResponse, 
             status_code=status.HTTP_201_CREATED
             )
async def user_register(user_data: UserCreate, db: Session = Depends(get_db)):
    email = user_data.email.lower()

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already register"
        )

    user = User(
        name = user_data.name,
        email = email,
        password = hash_passowrd(user_data.password),
        role = "user"
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)

    except:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already register."
        )
    return UserResponse(
        id=str(user.id),
        name=str(user.name),
        email=str(user.email),
        role=str(user.role),
        is_active=bool(user.is_active),
    )
