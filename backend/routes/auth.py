from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse, UserLogin
from utils.security import hash_passowrd, verify_password, create_access_token

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


@router.post("/login")
async def user_login(user_data: UserLogin,db:Session =Depends(get_db)):

    user = db.query(User).filter(User.email == user_data.email).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Email not find"
        )

    password= str(user.password)
    if not verify_password(user_data.password, password):
        raise HTTPException(
            status_code=400,
            detail="password not match"
        )
    
    if not bool(user.is_active):
        raise HTTPException(
            status_code=403,
            detail="Account is inactive"
        )

    access_token = create_access_token(
        user_id=str(user.id),
        role= str(user.role)
    )

    return({
        "auth_token": access_token,
        "token_type":"bearer",
        "name": user.name,
        "email":user.email,
        "role":user.is_active,
        "is_active":user.is_active,
        "created_at":user.created_at
    })