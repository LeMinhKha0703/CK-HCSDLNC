"""
database.py - Dependency Injection cho SQL Server và MongoDB
Cung cấp các hàm get_sql_conn() và get_mongo_db() để inject vào các route.
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

# ==========================================
# SQL SERVER ENGINE (Dùng SQLAlchemy + pymssql)
# ==========================================
_SQL_URL = (
    f"mssql+pymssql://{os.getenv('SQL_USER')}:{os.getenv('SQL_PASSWORD')}"
    f"@{os.getenv('SQL_SERVER')}/{os.getenv('SQL_DATABASE')}"
)
sql_engine = create_engine(_SQL_URL)


def get_sql_conn():
    """Dependency: Mở một SQL connection, yield ra, sau đó tự đóng."""
    with sql_engine.connect() as conn:
        yield conn


# ==========================================
# MONGODB CLIENT (Motor - async)
# ==========================================
_mongo_client: AsyncIOMotorClient = None


def init_mongo(client: AsyncIOMotorClient):
    global _mongo_client
    _mongo_client = client


def get_mongo_db():
    """Dependency: Trả về MongoDB database instance."""
    return _mongo_client[os.getenv("MONGODB_DATABASE")]
