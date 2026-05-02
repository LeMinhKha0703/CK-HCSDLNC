"""
routes/admin.py - Toàn bộ API dành cho Admin
Quản lý CRUD Users với quyền cao nhất.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from database import get_sql_conn
from auth import require_role, hash_password
from models import UserCreateRequest, UserUpdateRequest

router = APIRouter(prefix="/api/admin", tags=["Admin"])
_admin = require_role("Admin")


@router.get("/users")
def get_users(
    role: str = None,
    search: str = None,
    current_user=Depends(_admin),
    conn=Depends(get_sql_conn)
):
    """Lấy danh sách Users, hỗ trợ lọc theo Role và search theo tên/email."""
    query = "SELECT UserID, FullName, Email, Role, CreatedAt FROM Users WHERE 1=1"
    params = {}

    if role:
        query += " AND Role = :role"
        params["role"] = role
    if search:
        query += " AND (FullName LIKE :s OR Email LIKE :s)"
        params["s"] = f"%{search}%"

    query += " ORDER BY CreatedAt DESC"
    rows = conn.execute(text(query), params).fetchall()

    return [
        {
            "userId": str(r.UserID),
            "fullName": r.FullName,
            "email": r.Email,
            "role": r.Role,
            "createdAt": str(r.CreatedAt)
        }
        for r in rows
    ]


@router.post("/users")
def create_user(
    body: UserCreateRequest,
    current_user=Depends(_admin),
    conn=Depends(get_sql_conn)
):
    """Admin tạo tài khoản mới."""
    if body.role not in ("Student", "Teacher", "Admin"):
        raise HTTPException(status_code=400, detail="Role không hợp lệ")

    existing = conn.execute(
        text("SELECT UserID FROM Users WHERE Email = :email"),
        {"email": body.email}
    ).fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")

    conn.execute(text("""
        INSERT INTO Users (FullName, Email, PasswordHash, Role)
        VALUES (:fullName, :email, :pw, :role)
    """), {
        "fullName": body.fullName,
        "email": body.email,
        "pw": hash_password(body.password),
        "role": body.role
    })
    conn.commit()
    return {"message": f"Tạo tài khoản {body.email} thành công"}


@router.put("/users/{user_id}")
def update_user(
    user_id: str,
    body: UserUpdateRequest,
    current_user=Depends(_admin),
    conn=Depends(get_sql_conn)
):
    """Sửa thông tin User (FullName, Email, Role)."""
    sets, params = [], {"uid": user_id}

    if body.fullName:
        sets.append("FullName = :fullName")
        params["fullName"] = body.fullName
    if body.email:
        sets.append("Email = :email")
        params["email"] = body.email
    if body.role:
        if body.role not in ("Student", "Teacher", "Admin"):
            raise HTTPException(status_code=400, detail="Role không hợp lệ")
        sets.append("Role = :role")
        params["role"] = body.role

    if not sets:
        raise HTTPException(status_code=400, detail="Không có trường nào để cập nhật")

    conn.execute(text(f"UPDATE Users SET {', '.join(sets)} WHERE UserID = :uid"), params)
    conn.commit()
    return {"message": "Cập nhật thành công"}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    current_user=Depends(_admin),
    conn=Depends(get_sql_conn)
):
    """Xóa tài khoản User."""
    if user_id == current_user["user_id"]:
        raise HTTPException(status_code=400, detail="Không thể tự xóa tài khoản của mình")

    result = conn.execute(
        text("DELETE FROM Users WHERE UserID = :uid"),
        {"uid": user_id}
    )
    conn.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    return {"message": "Xóa tài khoản thành công"}
