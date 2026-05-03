"""
routes/auth.py - Register and Login API
POST /api/auth/register
POST /api/auth/login
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from database import get_sql_conn
from auth import hash_password, create_access_token
from models import LoginRequest, RegisterRequest

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register")
def register(body: RegisterRequest, conn=Depends(get_sql_conn)):
    """Đăng ký tài khoản mới. isTeacher=True -> Role=Teacher, còn lại là Student."""
    # Kiểm tra email đã tồn tại chưa
    existing = conn.execute(
        text("SELECT UserID FROM Users WHERE Email = :email"),
        {"email": body.email}
    ).fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    role = "Teacher" if body.isTeacher else "Student"
    hashed = hash_password(body.password)

    conn.execute(
        text("""
            INSERT INTO Users (FullName, Email, PasswordHash, Role)
            VALUES (:fullName, :email, :passwordHash, :role)
        """),
        {"fullName": body.fullName, "email": body.email, "passwordHash": hashed, "role": role}
    )
    conn.commit()
    return {"message": "Registration successful", "role": role}


@router.post("/login")
def login(body: LoginRequest, conn=Depends(get_sql_conn)):
    """Đăng nhập, trả về JWT token và thông tin user."""
    hashed = hash_password(body.password)

    row = conn.execute(
        text("""
            SELECT UserID, FullName, Role
            FROM Users
            WHERE Email = :email AND PasswordHash = :passwordHash
        """),
        {"email": body.email, "passwordHash": hashed}
    ).fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(row.UserID)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": row.Role,
        "fullName": row.FullName,
        "userId": str(row.UserID)
    }
