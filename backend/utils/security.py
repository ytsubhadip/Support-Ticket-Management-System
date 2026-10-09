import os
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash
from dotenv import load_dotenv

load_dotenv()

password_hash = PasswordHash.recommended()

secret_key = os.getenv("SECRET_KEY")

if not secret_key:
    raise ValueError("Secret key not found")

SECRET_KEY: str = secret_key

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60    


def hash_passowrd(password: str) -> str:
    """Hash a password before storing it"""

    return password_hash.hash(password)

def verify_password(
        plain_password:str,
        hashed_password:str
)-> bool:

    return password_hash.verify(
        plain_password,
        hashed_password
    )

def create_access_token(user_id:str, role:str)->str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": user_id,
        "role": role,
        "exp": expires_at
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)