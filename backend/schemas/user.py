from typing import Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID

class UserCreate(BaseModel):
     name : str = Field(min_length=2, max_length=100)
     email : EmailStr
     password : str=Field(min_length=8, max_length=128)
     role : Literal["user", "admin","support_agent"] = "user"

class UserLogin(BaseModel):
     email: EmailStr
     password : str = Field(min_length=8, max_length=128)
     
class UserResponse(BaseModel):
     id:UUID
     name : str
     email : EmailStr
     role: str
     is_active : bool

     model_config = ConfigDict(from_attributes=True)

class UserStatusUpdate(BaseModel):
    is_active: bool


class UserRoleUpdate(BaseModel):
    role: str