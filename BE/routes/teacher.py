"""
routes/teacher.py - Toàn bộ API dành cho Teacher
Bao gồm Polyglot Persistence route: Tạo bài thi (SQL + MongoDB)
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from database import get_sql_conn, get_mongo_db
from auth import require_role
from models import (
    GroupCreateRequest, InviteStudentsRequest,
    ExamCreateRequest, GradeSubmitRequest
)

router = APIRouter(prefix="/api/teacher", tags=["Teacher"])
_teacher = require_role("Teacher")


# ==========================================
# DASHBOARD
# ==========================================

@router.get("/dashboard")
def get_dashboard(current_user=Depends(_teacher), conn=Depends(get_sql_conn)):
    """Thống kê tổng số bài kiểm tra (Total, MCQ, Essay)."""
    uid = current_user["user_id"]
    row = conn.execute(text("""
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN e.Type = 'MCQ' THEN 1 ELSE 0 END) AS totalMCQ,
            SUM(CASE WHEN e.Type = 'Essay' THEN 1 ELSE 0 END) AS totalEssay
        FROM Exams e
        JOIN Groups g ON e.GroupID = g.GroupID
        WHERE g.TeacherID = :uid
    """), {"uid": uid}).fetchone()

    return {
        "totalAssignments": row.total,
        "multipleChoiceAssignments": row.totalMCQ,
        "essayAssignments": row.totalEssay
    }


# ==========================================
# GROUPS
# ==========================================

@router.get("/groups")
def get_groups(current_user=Depends(_teacher), conn=Depends(get_sql_conn)):
    """Danh sách các nhóm do giáo viên quản lý."""
    rows = conn.execute(text("""
        SELECT GroupID, GroupName, TotalStudent, CreatedAt
        FROM Groups WHERE TeacherID = :uid ORDER BY CreatedAt DESC
    """), {"uid": current_user["user_id"]}).fetchall()

    return [
        {
            "groupId": str(r.GroupID),
            "groupName": r.GroupName,
            "totalStudent": r.TotalStudent,
            "createdAt": str(r.CreatedAt)
        }
        for r in rows
    ]


@router.post("/groups")
def create_group(
    body: GroupCreateRequest,
    current_user=Depends(_teacher),
    conn=Depends(get_sql_conn)
):
    """Tạo nhóm học mới, có thể kèm danh sách email sinh viên."""
    uid = current_user["user_id"]

    # Tạo nhóm
    result = conn.execute(text("""
        INSERT INTO Groups (TeacherID, GroupName, TotalStudent)
        OUTPUT INSERTED.GroupID
        VALUES (:tid, :name, 0)
    """), {"tid": uid, "name": body.groupName})
    conn.commit()
    group_id = str(result.fetchone().GroupID)

    # Mời sinh viên nếu có
    invited = 0
    for email in (body.studentEmails or []):
        _invite_student_by_email(email, group_id, conn)
        invited += 1

    return {
        "message": "Tạo nhóm thành công",
        "groupId": group_id,
        "invitedCount": invited
    }


@router.get("/groups/{group_id}")
def get_group_detail(
    group_id: str,
    current_user=Depends(_teacher),
    conn=Depends(get_sql_conn)
):
    """Chi tiết nhóm: danh sách sinh viên kèm điểm trung bình. Lọc <5.0 và >8.0."""
    uid = current_user["user_id"]

    # Kiểm tra quyền sở hữu
    owner = conn.execute(text("""
        SELECT GroupName, TotalStudent FROM Groups WHERE GroupID = :gid AND TeacherID = :tid
    """), {"gid": group_id, "tid": uid}).fetchone()
    if not owner:
        raise HTTPException(status_code=403, detail="Không có quyền truy cập nhóm này")

    # Danh sách sinh viên + điểm trung bình
    rows = conn.execute(text("""
        SELECT u.UserID, u.FullName, u.Email,
               CASE WHEN v.GradedExamsCount > 0 
                    THEN CAST(v.TotalScoreSum / v.GradedExamsCount AS DECIMAL(5,2))
                    ELSE NULL END AS AverageGrade
        FROM Group_Students gs
        JOIN Users u ON gs.StudentID = u.UserID
        LEFT JOIN dbo.vw_StudentGroupScore v ON v.GroupID = gs.GroupID AND v.StudentID = gs.StudentID
        WHERE gs.GroupID = :gid
        ORDER BY AverageGrade DESC
    """), {"gid": group_id}).fetchall()

    students = [
        {
            "studentId": str(r.UserID),
            "fullName": r.FullName,
            "email": r.Email,
            "averageGrade": float(r.AverageGrade) if r.AverageGrade else None
        }
        for r in rows
    ]

    below5 = [s for s in students if s["averageGrade"] is not None and s["averageGrade"] < 5.0]
    above8 = [s for s in students if s["averageGrade"] is not None and s["averageGrade"] > 8.0]

    return {
        "groupName": owner.GroupName,
        "totalStudent": owner.TotalStudent,
        "students": students,
        "gradeLt5": len(below5),
        "gradeGt8": len(above8)
    }


@router.post("/groups/{group_id}/invite")
def invite_students(
    group_id: str,
    body: InviteStudentsRequest,
    current_user=Depends(_teacher),
    conn=Depends(get_sql_conn)
):
    """Gửi lời mời sinh viên vào nhóm."""
    uid = current_user["user_id"]

    owner = conn.execute(text("""
        SELECT GroupName FROM Groups WHERE GroupID = :gid AND TeacherID = :tid
    """), {"gid": group_id, "tid": uid}).fetchone()
    if not owner:
        raise HTTPException(status_code=403, detail="Không có quyền trên nhóm này")

    invited, not_found = [], []
    for email in body.studentEmails:
        sent = _invite_student_by_email(email, group_id, conn, group_name=owner.GroupName)
        (invited if sent else not_found).append(email)

    conn.commit()
    return {"invited": invited, "notFound": not_found}


def _invite_student_by_email(email: str, group_id: str, conn, group_name: str = ""):
    """Helper: Tìm student bằng email và tạo Notification mời vào nhóm."""
    student = conn.execute(text("""
        SELECT UserID FROM Users WHERE Email = :email AND Role = 'Student'
    """), {"email": email}).fetchone()
    if not student:
        return False

    # Kiểm tra đã trong nhóm chưa
    already = conn.execute(text("""
        SELECT 1 FROM Group_Students WHERE GroupID = :gid AND StudentID = :uid
    """), {"gid": group_id, "uid": str(student.UserID)}).fetchone()
    if already:
        return True  # Coi như thành công

    conn.execute(text("""
        INSERT INTO Notifications (UserID, Title, Content, Type, TargetID)
        VALUES (:uid, :title, :content, 'Invite_Group', :tid)
    """), {
        "uid": str(student.UserID),
        "title": f"Lời mời tham gia nhóm {group_name}",
        "content": f"Bạn được mời tham gia nhóm học '{group_name}'. Nhấn Accept để xác nhận.",
        "tid": group_id
    })
    return True


# ==========================================
# EXAMS
# ==========================================

@router.get("/exams")
def get_exams(current_user=Depends(_teacher), conn=Depends(get_sql_conn)):
    """Danh sách tất cả bài kiểm tra do giáo viên tạo."""
    rows = conn.execute(text("""
        SELECT e.ExamID, e.Title, g.GroupName, e.Type, e.TotalQuestions, e.CreatedAt, e.EndAt
        FROM Exams e
        JOIN Groups g ON e.GroupID = g.GroupID
        WHERE g.TeacherID = :uid
        ORDER BY e.CreatedAt DESC
    """), {"uid": current_user["user_id"]}).fetchall()

    return [
        {
            "examId": str(r.ExamID),
            "title": r.Title,
            "groupName": r.GroupName,
            "type": r.Type,
            "totalQuestions": r.TotalQuestions,
            "createdAt": str(r.CreatedAt),
            "endAt": str(r.EndAt)
        }
        for r in rows
    ]


@router.post("/exams")
async def create_exam(
    body: ExamCreateRequest,
    current_user=Depends(_teacher),
    conn=Depends(get_sql_conn),
    mongo=Depends(get_mongo_db)
):
    """
    [POLYGLOT PERSISTENCE ROUTE]
    Tạo bài thi theo mô hình Distributed Transaction:
    1. Lưu Metadata vào SQL Server -> lấy ExamID
    2. Lưu nội dung câu hỏi vào MongoDB với _id = ExamID
    3. Nếu bước 2 lỗi -> Rollback: xóa Exam khỏi SQL
    """
    uid = current_user["user_id"]

    # Kiểm tra quyền trên group
    owner = conn.execute(text("""
        SELECT 1 FROM Groups WHERE GroupID = :gid AND TeacherID = :tid
    """), {"gid": body.groupId, "tid": uid}).fetchone()
    if not owner:
        raise HTTPException(status_code=403, detail="Không có quyền tạo bài thi cho nhóm này")

    total_questions = len(body.questions)

    # Bước 1: Insert vào SQL Server
    result = conn.execute(text("""
        INSERT INTO Exams (GroupID, Title, Type, TotalQuestions, EndAt)
        OUTPUT INSERTED.ExamID
        VALUES (:gid, :title, :type, :tq, :endAt)
    """), {
        "gid": body.groupId,
        "title": body.title,
        "type": body.type,
        "tq": total_questions,
        "endAt": body.endAt
    })
    conn.commit()
    exam_id = str(result.fetchone().ExamID)

    # Bước 2: Insert nội dung câu hỏi vào MongoDB
    questions_data = []
    for i, q in enumerate(body.questions, start=1):
        q_doc = {"questionId": i, "content": q.content}
        if body.type == "MCQ" and q.options:
            q_doc["options"] = {
                "A": q.options.a,
                "B": q.options.b,
                "C": q.options.c,
                "D": q.options.d
            }
            q_doc["correctAnswer"] = (q.correctAnswer or "").upper()
        questions_data.append(q_doc)

    try:
        await mongo["Exam_Questions"].insert_one({
            "_id": exam_id,
            "questions": questions_data
        })
    except Exception as e:
        # Rollback: xóa exam khỏi SQL nếu Mongo lỗi
        conn.execute(text("DELETE FROM Exams WHERE ExamID = :eid"), {"eid": exam_id})
        conn.commit()
        raise HTTPException(status_code=500, detail=f"Lỗi lưu câu hỏi vào MongoDB, đã rollback: {str(e)}")

    return {
        "message": "Tạo bài kiểm tra thành công",
        "examId": exam_id,
        "totalQuestions": total_questions
    }


@router.get("/exams/{exam_id}")
async def get_exam_detail(
    exam_id: str,
    current_user=Depends(_teacher),
    conn=Depends(get_sql_conn),
    mongo=Depends(get_mongo_db)
):
    """
    Chi tiết bài thi: thông tin, danh sách submissions, và
    dữ liệu biểu đồ Analytics từ MongoDB Aggregation Pipeline.
    """
    uid = current_user["user_id"]

    exam = conn.execute(text("""
        SELECT e.ExamID, e.Title, e.Type, e.TotalQuestions, e.CreatedAt, e.EndAt
        FROM Exams e
        JOIN Groups g ON e.GroupID = g.GroupID
        WHERE e.ExamID = :eid AND g.TeacherID = :tid
    """), {"eid": exam_id, "tid": uid}).fetchone()
    if not exam:
        raise HTTPException(status_code=404, detail="Bài thi không tồn tại")

    # Danh sách bài nộp
    subs = conn.execute(text("""
        SELECT s.SubmissionID, u.FullName, s.Status, s.TotalScore, s.SubmitedAt
        FROM Submissions s JOIN Users u ON s.StudentID = u.UserID
        WHERE s.ExamID = :eid
        ORDER BY s.SubmitedAt
    """), {"eid": exam_id}).fetchall()

    # MongoDB Aggregation để lấy data biểu đồ
    chart_data = []
    if exam.Type == "MCQ":
        # Question Performance: đếm số đúng / sai theo từng câu
        pipeline = [
            {"$match": {"examId": exam_id}},
            {"$unwind": "$answers"},
            {"$group": {
                "_id": "$answers.questionId",
                "totalAnswers": {"$sum": 1},
                "correctAnswers": {"$sum": {"$cond": [{"$eq": ["$answers.isCorrect", True]}, 1, 0]}}
            }},
            {"$sort": {"_id": 1}}
        ]
        async for doc in mongo["Submission_Answers"].aggregate(pipeline):
            chart_data.append({
                "questionId": doc["_id"],
                "totalAnswers": doc["totalAnswers"],
                "correctAnswers": doc["correctAnswers"]
            })
    else:
        # Average Score per Question: điểm trung bình từng câu tự luận
        pipeline = [
            {"$match": {"examId": exam_id}},
            {"$unwind": "$answers"},
            {"$group": {
                "_id": "$answers.questionId",
                "averageScore": {"$avg": "$answers.score"}
            }},
            {"$sort": {"_id": 1}}
        ]
        async for doc in mongo["Submission_Answers"].aggregate(pipeline):
            chart_data.append({
                "questionId": doc["_id"],
                "averageScore": round(doc["averageScore"], 2)
            })

    return {
        "examId": str(exam.ExamID),
        "title": exam.Title,
        "type": exam.Type,
        "totalQuestions": exam.TotalQuestions,
        "createdAt": str(exam.CreatedAt),
        "endAt": str(exam.EndAt),
        "chartData": chart_data,
        "submissions": [
            {
                "submissionId": str(s.SubmissionID),
                "fullName": s.FullName,
                "status": s.Status,
                "totalScore": float(s.TotalScore) if s.TotalScore is not None else None,
                "submitedAt": str(s.SubmitedAt)
            }
            for s in subs
        ]
    }


@router.get("/exams/{exam_id}/submissions/{submission_id}")
async def get_submission_detail(
    exam_id: str,
    submission_id: str,
    current_user=Depends(_teacher),
    conn=Depends(get_sql_conn),
    mongo=Depends(get_mongo_db)
):
    """Xem chi tiết bài làm của một sinh viên từ MongoDB."""
    uid = current_user["user_id"]

    # Kiểm tra quyền
    sub = conn.execute(text("""
        SELECT s.SubmissionID, u.FullName, s.Status, s.TotalScore, s.SubmitedAt, e.Type
        FROM Submissions s
        JOIN Users u ON s.StudentID = u.UserID
        JOIN Exams e ON s.ExamID = e.ExamID
        JOIN Groups g ON e.GroupID = g.GroupID
        WHERE s.SubmissionID = :sid AND e.ExamID = :eid AND g.TeacherID = :tid
    """), {"sid": submission_id, "eid": exam_id, "tid": uid}).fetchone()

    if not sub:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài nộp")

    # Lấy câu hỏi từ Exam_Questions để hiển thị nội dung
    exam_doc = await mongo["Exam_Questions"].find_one({"_id": exam_id})
    question_map = {q["questionId"]: q for q in (exam_doc or {}).get("questions", [])}

    # Lấy bài làm từ Submission_Answers
    ans_doc = await mongo["Submission_Answers"].find_one({"_id": submission_id})
    answers = []
    for a in (ans_doc or {}).get("answers", []):
        qid = a["questionId"]
        q_info = question_map.get(qid, {})
        answers.append({
            "questionId": qid,
            "content": q_info.get("content", ""),
            "options": q_info.get("options"),
            "correctAnswer": q_info.get("correctAnswer"),
            "studentResponse": a["studentResponse"],
            "isCorrect": a.get("isCorrect"),
            "score": a.get("score", 0)
        })

    return {
        "fullName": sub.FullName,
        "status": sub.Status,
        "totalScore": float(sub.TotalScore) if sub.TotalScore is not None else None,
        "submitedAt": str(sub.SubmitedAt),
        "examType": sub.Type,
        "answers": answers
    }


@router.post("/exams/{exam_id}/submissions/{submission_id}/grade")
async def grade_submission(
    exam_id: str,
    submission_id: str,
    body: GradeSubmitRequest,
    current_user=Depends(_teacher),
    conn=Depends(get_sql_conn),
    mongo=Depends(get_mongo_db)
):
    """
    [POLYGLOT PERSISTENCE ROUTE]
    Chấm điểm bài Tự luận:
    1. Cập nhật score từng câu vào MongoDB Submission_Answers
    2. Tính tổng điểm -> Cập nhật TotalScore + Status='Graded' vào SQL
    """
    uid = current_user["user_id"]

    sub = conn.execute(text("""
        SELECT s.SubmissionID, e.Type, e.TotalQuestions
        FROM Submissions s
        JOIN Exams e ON s.ExamID = e.ExamID
        JOIN Groups g ON e.GroupID = g.GroupID
        WHERE s.SubmissionID = :sid AND s.ExamID = :eid AND g.TeacherID = :tid AND e.Type = 'Essay'
    """), {"sid": submission_id, "eid": exam_id, "tid": uid}).fetchone()

    if not sub:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài tự luận cần chấm")

    # Bước 1: Cập nhật score từng câu vào MongoDB
    grade_map = {g.questionId: g.score for g in body.grades}
    ans_doc = await mongo["Submission_Answers"].find_one({"_id": submission_id})
    if not ans_doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy chi tiết bài làm trong MongoDB")

    updated_answers = []
    for a in ans_doc.get("answers", []):
        a["score"] = grade_map.get(a["questionId"], a.get("score", 0))
        updated_answers.append(a)

    await mongo["Submission_Answers"].update_one(
        {"_id": submission_id},
        {"$set": {"answers": updated_answers}}
    )

    # Bước 2: Tính tổng điểm và cập nhật SQL
    total_score = round(sum(a["score"] for a in updated_answers), 2)

    conn.execute(text("""
        UPDATE Submissions
        SET TotalScore = :score, Status = 'Graded'
        WHERE SubmissionID = :sid
    """), {"score": total_score, "sid": submission_id})
    conn.commit()

    return {"message": "Chấm điểm thành công", "totalScore": total_score}
