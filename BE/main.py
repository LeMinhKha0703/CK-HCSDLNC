"""
main.py - FastAPI Application Entry Point
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

from database import init_mongo
from routes import auth, student, teacher, admin

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: kết nối MongoDB
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    init_mongo(client)
    db = client[os.getenv("MONGODB_DATABASE")]
    await db.command("ping")
    print("✅ MongoDB connection established successfully")
    yield
    # Shutdown: đóng kết nối
    client.close()
    print("MongoDB connection closed")

app = FastAPI(
    title="E-Learning Analytics API",
    description="Backend API for E-Learning Management System - Polyglot Persistence (SQL Server + MongoDB)",
    version="2.0.0",
    lifespan=lifespan
)

# CORS - Cho phép React FE gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký các routes
app.include_router(auth.router)
app.include_router(student.router)
app.include_router(teacher.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {"message": "E-Learning Analytics API is running!", "docs": "/docs"}
