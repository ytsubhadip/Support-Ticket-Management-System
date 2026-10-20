from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from schemas.user import UserResponse, UserRoleUpdate, UserStatusUpdate

from uuid import UUID
from database import get_db 
from models.user import User
from utils.auth import get_current_user

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"]
)



@router.get("/", response_model= list[UserResponse])
async def get_users(
    db: Session = Depends(get_db),
    current_user:User = Depends(get_current_user)
):
    # admin only
    if str(current_user.role) != "admin":
        raise HTTPException(
            status_code= status.HTTP_403_FORBIDDEN,
            detail="Only admin can view all users"
        )


    users = (
        db.query(User)
        .filter(User.role != "admin")
        .order_by(User.created_at.desc())
        .all()
    )

    return users;


@router.get("/support-agents", response_model=list[UserResponse])
async def get_support_agent(
    db:Session=Depends(get_db),
    current_user : User = Depends(get_current_user)
):
    # Admin only
    if str(current_user.role) != "admin":
        raise HTTPException(
            status_code= status.HTTP_403_FORBIDDEN,
            detail="Only admin can view support agent"
        )

    agents = (
        db.query(User)
        .filter(
            User.role == "support_agent",
            User.is_active   == True
        )
        .all()
    )

    return agents



# change user active status


@router.patch(
    "/{user_id}/status",
    response_model=UserResponse
)
async def update_user_status(
    user_id: UUID,
    user_data: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Activate or deactivate a user.
    Admin only.
    """

     # Admin only
    if str(current_user.role) != "admin":
            raise HTTPException(
                status_code= status.HTTP_403_FORBIDDEN,
                detail="Only admin can view support agent"
            )

   
    # Find user

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # -----------------------------------------------------
    # Prevent admin from deactivating themselves
    # -----------------------------------------------------

    if user.id == current_user.id and not user_data.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account"
        )

    # -----------------------------------------------------
    # Update status
    # -----------------------------------------------------

    user.is_active = user_data.is_active

    db.commit()
    db.refresh(user)

    return user



# =========================================================
# CHANGE USER ROLE
# =========================================================

@router.patch(
    "/{user_id}/role",
    response_model=UserResponse
)
async def update_user_role(
    user_id: UUID,
    user_data: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Change user role.
    Admin only.
    """

    require_admin(current_user)

    # -----------------------------------------------------
    # Validate role
    # -----------------------------------------------------

    allowed_roles = {
        "user",
        "support_agent",
        "admin"
    }

    if user_data.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )

    # -----------------------------------------------------
    # Find user
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # -----------------------------------------------------
    # Prevent changing own admin role
    # -----------------------------------------------------

    if user.id == current_user.id:

        if user_data.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot change your own admin role"
            )

    # -----------------------------------------------------
    # Update role
    # -----------------------------------------------------

    user.role = user_data.role

    db.commit()
    db.refresh(user)

    return user