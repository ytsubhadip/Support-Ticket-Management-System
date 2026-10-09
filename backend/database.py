import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = str(os.getenv("DATABASE_URL"))

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True
)

SessionLOcal = sessionmaker(
    autocommit = False,
    autoflush= False,
    bind= engine
)

Base = declarative_base()



def get_db():
    db= SessionLOcal()

    try:
        yield db
    finally:
        db.close()