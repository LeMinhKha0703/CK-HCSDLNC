"""
routes/student.py - Toàn bộ API dành cho Student
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from bson import ObjectId

from database import get_sql_conn, get_mongo_db
from auth import get_current_user, require_role, hash_password
from models import ExamSubmitRequest

router = APIRouter(prefix="/api/student", tags=["Student"])
_student = require_role("Student")


# ==========================================
# GROUPS
# ==========================================

@router.get("/groups")
def get_my_groups(
    current_user=Depends(_student),
    conn=Depends(get_sql_conn)
):
    """Lấy danh sách nhóm học của sinh viên, kèm Average Grade và Rank."""
    uid = current_user["user_id"]

    rows = conn.execute(text("""
        SELECT
            g.GroupID,
            g.GroupName,
            u.FullName  AS TeacherName,
            g.CreatedAt,
            -- Average Grade từ Indexed View vw_StudentGroupScore
            CASE 
                WHEN v.GradedExamsCount > 0 
                THEN CAST(v.TotalScoreSum / v.GradedExamsCount AS DECIMAL(5,2))
                ELSE NULL 
            END AS AverageGrade,
            -- Rank trong nhóm (xếp hạng dựa trên Average Score giảm dần)
            RANK() OVER (
                PARTITION BY g.GroupID
                ORDER BY CASE WHEN v2.GradedExamsCount > 0 
                              THEN v2.TotalScoreSum / v2.GradedExamsCount 
                              ELSE -1 END DESC
            ) AS RankPosition
        FROM Group_Students gs
        JOIN Groups g ON gs.GroupID = g.GroupID
        JOIN Users u ON g.TeacherID = u.UserID
        LEFT JOIN dbo.vw_StudentGroupScore v 
            ON v.GroupID = g.GroupID AND v.StudentID = gs.StudentID
        LEFT JOIN dbo.vw_StudentGroupScore v2
            ON v2.GroupID = g.GroupID AND v2.StudentID = :uid
        WHERE gs.StudentID = :uid
    """), {"uid": uid}).fetchall()

    return [
        {
            "groupId": str(r.GroupID),
            "groupName": r.GroupName,
            "teacherName": r.TeacherName,
            "createdAt": str(r.CreatedAt),
            "averageGrade": float(r.AverageGrade) if r.AverageGrade else None,
            "rankPosition": r.RankPosition
        }
        for r in rows
    ]


@router.get("/groups/{group_id}")
def get_group_detail(
    group_id: str,
    current_user=Depends(_student),
    conn=Depends(get_sql_conn)
):
    """Chi tiết nhóm: thông tin nhóm + danh sách bài kiểm tra kèm trạng thái."""
    uid = current_user["user_id"]

    # Kiểm tra sinh viên có trong nhóm không
    member = conn.execute(text("""
        SELECT 1 FROM Group_Students WHERE GroupID = :gid AND StudentID = :uid
    """), {"gid": group_id, "uid": uid}).fetchone()
    if not member:
        raise HTTPException(status_code=403, detail="Bạn không thuộc nhóm này")

    # Thông tin nhóm
    group = conn.execute(text("""
        SELECT g.GroupName, u.FullName AS TeacherName
        FROM Groups g JOIN Users u ON g.TeacherID = u.UserID
        WHERE g.GroupID = :gid
    """), {"gid": group_id}).fetchone()

    # Điểm TB và Rank
    score_row = conn.execute(text("""
        SELECT TotalScoreSum, GradedExamsCount FROM dbo.vw_StudentGroupScore
        WHERE GroupID = :gid AND StudentID = :uid
    """), {"gid": group_id, "uid": uid}).fetchone()

    avg = None
    if score_row and score_row.GradedExamsCount > 0:
        avg = round(score_row.TotalScoreSum / score_row.GradedExamsCount, 2)

    rank_row = conn.execute(text("""
        SELECT ranked.RankPosition FROM (
            SELECT StudentID,
                   RANK() OVER (ORDER BY TotalScoreSum / GradedExamsCount DESC) AS RankPosition
            FROM dbo.vw_StudentGroupScore WHERE GroupID = :gid
        ) ranked WHERE ranked.StudentID = :uid
    """), {"gid": group_id, "uid": uid}).fetchone()

    # Danh sách bài thi kèm trạng thái
    exams = conn.execute(text("""
        SELECT e.ExamID, e.Title, e.Type, e.EndAt,
               s.SubmissionID, s.TotalScore, s.Status
        FROM Exams e
        LEFT JOIN Submissions s ON s.ExamID = e.ExamID AND s.StudentID = :uid
        WHERE e.GroupID = :gid
        ORDER BY e.CreatedAt DESC
    """), {"gid": group_id, "uid": uid}).fetchall()

    return {
        "groupName": group.GroupName,
        "teacherName": group.TeacherName,
        "averageGrade": avg,
        "rankPosition": rank_row.RankPosition if rank_row else None,
        "exams": [
            {
                "examId": str(e.ExamID),
                "title": e.Title,
                "type": e.Type,
                "endAt": str(e.EndAt),
                "submissionId": str(e.SubmissionID) if e.SubmissionID else None,
                "totalScore": float(e.TotalScore) if e.TotalScore is not None else None,
                "status": e.Status  # None = chưa nộp, "Pending"/"Graded"/"Locked"
            }
            for e in exams
        ]
    }


# ==========================================
# EXAMS
# ==========================================

@router.get("/exams/{exam_id}")
async def get_exam_content(
    exam_id: str,
    current_user=Depends(_student),
    conn=Depends(get_sql_conn),
    mongo=Depends(get_mongo_db)
):
    """Lấy nội dung bài thi: Metadata từ SQL + câu hỏi từ MongoDB."""
    # Kiểm tra exam tồn tại trong SQL
    exam = conn.execute(text("""
        SELECT e.ExamID, e.Title, e.Type, e.TotalQuestions, e.EndAt, e.GroupID
        FROM Exams e
        JOIN Group_Students gs ON gs.GroupID = e.GroupID
        WHERE e.ExamID = :eid AND gs.StudentID = :uid
    """), {"eid": exam_id, "uid": current_user["user_id"]}).fetchone()

    if not exam:
        raise HTTPException(status_code=404, detail="Bài thi không tồn tại hoặc bạn không có quyền")

    # Kiểm tra đã nộp chưa (không cho làm lại)
    submitted = conn.execute(text("""
        SELECT SubmissionID FROM Submissions WHERE ExamID = :eid AND StudentID = :uid
    """), {"eid": exam_id, "uid": current_user["user_id"]}).fetchone()
    if submitted:
        raise HTTPException(status_code=400, detail="Bạn đã nộp bài thi này rồi")

    # Lấy câu hỏi từ MongoDB
    doc = await mongo["Exam_Questions"].find_one({"_id": exam_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Nội dung đề thi chưa được tải lên")

    # Ẩn correctAnswer khi trả về cho sinh viên
    questions = []
    for q in doc.get("questions", []):
        item = {"questionId": q["questionId"], "content": q["content"]}
        if exam.Type == "MCQ":
            item["options"] = q.get("options", {})
        questions.append(item)

    return {
        "examId": str(exam.ExamID),
        "title": exam.Title,
        "type": exam.Type,
        "totalQuestions": exam.TotalQuestions,
        "endAt": str(exam.EndAt),
        "questions": questions
    }


@router.post("/exams/{exam_id}/submit")
async def submit_exam(
    exam_id: str,
    body: ExamSubmitRequest,
    current_user=Depends(_student),
    conn=Depends(get_sql_conn),
    mongo=Depends(get_mongo_db)
):
    """
    Nộp bài - Polyglot Persistence:
    1. Lấy đáp án đúng từ MongoDB để chấm tự động (MCQ)
    2. Tính điểm, lưu Submission metadata vào SQL Server
    3. Lưu chi tiết câu trả lời vào MongoDB Submission_Answers
    """
    uid = current_user["user_id"]

    # Kiểm tra chưa nộp
    submitted = conn.execute(text("""
        SELECT SubmissionID FROM Submissions WHERE ExamID = :eid AND StudentID = :uid
    """), {"eid": exam_id, "uid": uid}).fetchone()
    if submitted:
        raise HTTPException(status_code=400, detail="Bạn đã nộp bài này rồi")

    # Lấy metadata exam (type, totalQuestions)
    exam = conn.execute(text("""
        SELECT ExamID, Type, TotalQuestions FROM Exams WHERE ExamID = :eid
    """), {"eid": exam_id}).fetchone()
    if not exam:
        raise HTTPException(status_code=404, detail="Bài thi không tồn tại")

    # Lấy đáp án đúng từ MongoDB
    exam_doc = await mongo["Exam_Questions"].find_one({"_id": exam_id})
    correct_map = {}
    if exam_doc:
        for q in exam_doc.get("questions", []):
            correct_map[q["questionId"]] = q.get("correctAnswer")

    # Chấm điểm tự động (MCQ) hoặc đặt Pending (Essay)
    answers_detail = []
    correct_count = 0
    point_per_question = round(10.0 / exam.TotalQuestions, 4) if exam.TotalQuestions > 0 else 0

    for ans in body.answers:
        is_correct = None
        score = 0.0
        if exam.Type == "MCQ":
            is_correct = (ans.studentResponse.upper() == str(correct_map.get(ans.questionId, "")).upper())
            score = point_per_question if is_correct else 0.0
            if is_correct:
                correct_count += 1
        answers_detail.append({
            "questionId": ans.questionId,
            "studentResponse": ans.studentResponse,
            "isCorrect": is_correct,
            "score": score
        })

    total_score = round(correct_count * point_per_question, 2) if exam.Type == "MCQ" else 0.0
    status = "Graded" if exam.Type == "MCQ" else "Pending"

    # Lưu vào SQL Server (lấy SubmissionID)
    result = conn.execute(text("""
        INSERT INTO Submissions (ExamID, StudentID, TotalScore, Status)
        OUTPUT INSERTED.SubmissionID
        VALUES (:eid, :uid, :score, :status)
    """), {"eid": exam_id, "uid": uid, "score": total_score, "status": status})
    conn.commit()
    submission_id = str(result.fetchone().SubmissionID)

    # Lưu chi tiết vào MongoDB
    await mongo["Submission_Answers"].insert_one({
        "_id": submission_id,
        "examId": exam_id,
        "studentId": uid,
        "answers": answers_detail
    })

    return {
        "submissionId": submission_id,
        "status": status,
        "totalScore": total_score if exam.Type == "MCQ" else None,
        "message": "Nộp bài thành công!" if exam.Type == "MCQ" else "Bài tự luận đã ghi nhận, chờ giảng viên chấm."
    }


# ==========================================
# NOTIFICATIONS
# ==========================================

@router.get("/notifications")
def get_notifications(
    current_user=Depends(_student),
    conn=Depends(get_sql_conn)
):
    """Lấy danh sách thông báo của sinh viên."""
    rows = conn.execute(text("""
        SELECT NotifID, Title, Content, Type, TargetID, IsRead, SendDate
        FROM Notifications WHERE UserID = :uid
        ORDER BY SendDate DESC
    """), {"uid": current_user["user_id"]}).fetchall()

    return [
        {
            "notifId": str(r.NotifID),
            "title": r.Title,
            "content": r.Content,
            "type": r.Type,
            "targetId": str(r.TargetID) if r.TargetID else None,
            "isRead": bool(r.IsRead),
            "sendDate": str(r.SendDate)
        }
        for r in rows
    ]


@router.post("/notifications/{notif_id}/accept")
def accept_invitation(
    notif_id: str,
    current_user=Depends(_student),
    conn=Depends(get_sql_conn)
):
    """Chấp nhận lời mời vào nhóm."""
    uid = current_user["user_id"]

    notif = conn.execute(text("""
        SELECT TargetID FROM Notifications
        WHERE NotifID = :nid AND UserID = :uid AND Type = 'Invite_Group'
    """), {"nid": notif_id, "uid": uid}).fetchone()

    if not notif:
        raise HTTPException(status_code=404, detail="Thông báo không tồn tại")

    group_id = str(notif.TargetID)

    # Kiểm tra đã trong nhóm chưa
    already = conn.execute(text("""
        SELECT 1 FROM Group_Students WHERE GroupID = :gid AND StudentID = :uid
    """), {"gid": group_id, "uid": uid}).fetchone()

    if not already:
        conn.execute(text("""
            INSERT INTO Group_Students (GroupID, StudentID) VALUES (:gid, :uid)
        """), {"gid": group_id, "uid": uid})
        conn.execute(text("""
            UPDATE Groups SET TotalStudent = TotalStudent + 1 WHERE GroupID = :gid
        """), {"gid": group_id})

    # Đánh dấu đã đọc thông báo
    conn.execute(text("""
        UPDATE Notifications SET IsRead = 1 WHERE NotifID = :nid
    """), {"nid": notif_id})
    conn.commit()

    return {"message": "Đã tham gia nhóm thành công!", "groupId": group_id}
