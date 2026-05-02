"""
models.py - Pydantic Schemas cho Request Body và Response
Định nghĩa cấu trúc dữ liệu để FastAPI validate tự động.
"""
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime


# ==========================================
# AUTH
# ==========================================
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    fullName: str
    email: str
    password: str
    isTeacher: bool = False


# ==========================================
# STUDENT
# ==========================================
class AnswerSubmit(BaseModel):
    questionId: int
    studentResponse: str  # Chữ cái "A"/"B"/"C"/"D" cho MCQ, hoặc văn bản cho Essay

class ExamSubmitRequest(BaseModel):
    answers: List[AnswerSubmit]


# ==========================================
# TEACHER
# ==========================================
class MCQOption(BaseModel):
    a: str
    b: str
    c: str
    d: str

class QuestionCreate(BaseModel):
    content: str
    options: Optional[MCQOption] = None        # Chỉ có khi Type = MCQ
    correctAnswer: Optional[str] = None        # "A"/"B"/"C"/"D", chỉ khi MCQ

class ExamCreateRequest(BaseModel):
    title: str
    type: str                                  # "MCQ" hoặc "Essay"
    groupId: str
    endAt: datetime
    questions: List[QuestionCreate]

class GradeAnswerRequest(BaseModel):
    questionId: int
    score: float

class GradeSubmitRequest(BaseModel):
    grades: List[GradeAnswerRequest]


# ==========================================
# ADMIN
# ==========================================
class UserCreateRequest(BaseModel):
    fullName: str
    email: str
    password: str
    role: str  # "Student", "Teacher", "Admin"

class UserUpdateRequest(BaseModel):
    fullName: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


# ==========================================
# GROUP
# ==========================================
class GroupCreateRequest(BaseModel):
    groupName: str
    studentEmails: Optional[List[str]] = []

class InviteStudentsRequest(BaseModel):
    studentEmails: List[str]
