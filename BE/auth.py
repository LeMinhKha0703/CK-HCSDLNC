"""
auth.py - JWT Authentication Utilities
Xử lý tạo token, giải mã token và dependency get_current_user.
"""
import os
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy import text

from database import get_sql_conn

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    """Hash mật khẩu bằng SHA-256 (đơn giản, đủ dùng cho demo)."""
    return hashlib.sha256(password.encode()).hexdigest()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Tạo JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Giải mã JWT token, raise nếu hết hạn hoặc sai chữ ký."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token đã hết hạn")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    conn=Depends(get_sql_conn)
):
    """Dependency: Lấy thông tin user hiện tại từ JWT token."""
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token không chứa user ID")

    row = conn.execute(
        text("SELECT UserID, FullName, Email, Role FROM Users WHERE UserID = :uid"),
        {"uid": user_id}
    ).fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Người dùng không tồn tại")

    return {"user_id": str(row.UserID), "full_name": row.FullName, "email": row.Email, "role": row.Role}


def require_role(*roles: str):
    """Dependency factory: Kiểm tra user có thuộc role được phép không."""
    def checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in roles:
            raise HTTPException(status_code=403, detail=f"Yêu cầu quyền: {', '.join(roles)}")
        return current_user
    return checker
