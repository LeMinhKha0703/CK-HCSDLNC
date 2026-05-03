"""
routes/student.py - All APIs for Student role

Advanced DB Integration:
  - GET /groups         : Dùng vw_StudentRankInGroup (Window Functions + CTE)
  - GET /groups/{id}    : Dùng fn_GetGroupLeaderboard (Table-Valued Function)
  - POST /notifications/{id}/accept : Gọi sp_AcceptGroupInvitation (Stored Procedure + Transaction)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from database import get_sql_conn, get_mongo_db
from auth import get_current_user, require_role
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
    """
    Lấy danh sách nhóm học của sinh viên.
    [ADVANCED DB] Dùng View vw_StudentRankInGroup (Window Function + CTE)
    để lấy AverageGrade và RankPosition được tính sẵn.
    """
    uid = current_user["user_id"]

    rows = conn.execute(text("""
        SELECT
            g.GroupID,
            g.GroupName,
            u.FullName  AS TeacherName,
            g.CreatedAt,
            -- Lấy AverageGrade và RankPosition từ View vw_StudentRankInGroup
            r.AverageGrade,
            r.RankPosition
        FROM Group_Students gs
        JOIN Groups g  ON gs.GroupID  = g.GroupID
        JOIN Users u   ON g.TeacherID = u.UserID
        -- LEFT JOIN với view: sinh viên chưa có bài graded sẽ vẫn được trả về (NULL)
        LEFT JOIN dbo.vw_StudentRankInGroup r
            ON r.GroupID = g.GroupID AND r.StudentID = gs.StudentID
        WHERE gs.StudentID = :uid
        ORDER BY g.CreatedAt DESC
    """), {"uid": uid}).fetchall()

    return [
        {
            "groupId": str(r.GroupID),
            "groupName": r.GroupName,
            "teacherName": r.TeacherName,
            "createdAt": str(r.CreatedAt),
            "averageGrade": float(r.AverageGrade) if r.AverageGrade is not None else None,
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
    """
    Chi tiết nhóm: thông tin nhóm + danh sách bài kiểm tra kèm trạng thái.
    [ADVANCED DB] Dùng Table-Valued Function fn_GetGroupLeaderboard
    để lấy điểm TB và xếp hạng của sinh viên trong nhóm.
    """
    uid = current_user["user_id"]

    # Kiểm tra sinh viên có trong nhóm không
    member = conn.execute(text("""
        SELECT 1 FROM Group_Students WHERE GroupID = :gid AND StudentID = :uid
    """), {"gid": group_id, "uid": uid}).fetchone()
    if not member:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    # Thông tin nhóm
    group = conn.execute(text("""
        SELECT g.GroupName, u.FullName AS TeacherName
        FROM Groups g JOIN Users u ON g.TeacherID = u.UserID
        WHERE g.GroupID = :gid
    """), {"gid": group_id}).fetchone()

    # [ADVANCED DB] Dùng Table-Valued Function fn_GetGroupLeaderboard để lấy rank của sinh viên cụ thể
    rank_row = conn.execute(text("""
        SELECT AverageGrade, RankPosition
        FROM dbo.fn_GetGroupLeaderboard(:gid)
        WHERE StudentID = :uid
    """), {"gid": group_id, "uid": uid}).fetchone()

    # Danh sách bài thi kèm trạng thái submission
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
        "averageGrade": float(rank_row.AverageGrade) if rank_row and rank_row.AverageGrade is not None else None,
        "rankPosition": rank_row.RankPosition if rank_row else None,
        "exams": [
            {
                "examId": str(e.ExamID),
                "title": e.Title,
                "type": e.Type,
                "endAt": str(e.EndAt),
                "submissionId": str(e.SubmissionID) if e.SubmissionID else None,
                "totalScore": float(e.TotalScore) if e.TotalScore is not None else None,
                "status": e.Status  # None = not submitted, "Pending"/"Graded"/"Locked"
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
    # Kiểm tra exam tồn tại và sinh viên có quyền truy cập (phải là thành viên nhóm)
    exam = conn.execute(text("""
        SELECT e.ExamID, e.Title, e.Type, e.TotalQuestions, e.EndAt, e.GroupID
        FROM Exams e
        JOIN Group_Students gs ON gs.GroupID = e.GroupID
        WHERE e.ExamID = :eid AND gs.StudentID = :uid
    """), {"eid": exam_id, "uid": current_user["user_id"]}).fetchone()

    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found or you do not have access")

    # Kiểm tra đã nộp chưa (không cho làm lại)
    submitted = conn.execute(text("""
        SELECT SubmissionID FROM Submissions WHERE ExamID = :eid AND StudentID = :uid
    """), {"eid": exam_id, "uid": current_user["user_id"]}).fetchone()
    if submitted:
        raise HTTPException(status_code=400, detail="You have already submitted this exam")

    # Lấy câu hỏi từ MongoDB
    doc = await mongo["Exam_Questions"].find_one({"_id": exam_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Exam content has not been uploaded yet")

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
        raise HTTPException(status_code=400, detail="You have already submitted this exam")

    # Lấy metadata exam (type, totalQuestions)
    exam = conn.execute(text("""
        SELECT ExamID, Type, TotalQuestions FROM Exams WHERE ExamID = :eid
    """), {"eid": exam_id}).fetchone()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

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
        "message": "Exam submitted successfully!" if exam.Type == "MCQ" else "Essay submitted. Awaiting teacher grading."
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
    """
    Chấp nhận lời mời vào nhóm.
    [ADVANCED DB] Gọi Stored Procedure sp_AcceptGroupInvitation để đảm bảo ACID.
    SP xử lý: validate lời mời, kiểm tra trùng lặp, INSERT Group_Students
    (trigger tự cập nhật TotalStudent), và đánh dấu IsRead.
    Mọi lỗi từ SP (RAISERROR) được bắt và trả về HTTP 400 rõ ràng.
    """
    uid = current_user["user_id"]

    try:
        result = conn.execute(
            text("EXEC dbo.sp_AcceptGroupInvitation @NotifID = :nid, @StudentID = :uid"),
            {"nid": notif_id, "uid": uid}
        ).fetchone()
        conn.commit()

        return {
            "message": "Successfully joined the group",
            "groupId": str(result.JoinedGroupID) if result else None
        }
    except Exception as e:
        conn.rollback()
        # Parse error message từ RAISERROR trong SP để trả về lỗi thân thiện
        err_msg = str(e)
        if "ERR_INVITATION_NOT_FOUND" in err_msg:
            raise HTTPException(status_code=404, detail="Invitation not found or does not belong to you")
        if "ERR_ALREADY_MEMBER" in err_msg:
            raise HTTPException(status_code=400, detail="You are already a member of this group")
        raise HTTPException(status_code=500, detail=f"Database error: {err_msg}")


# ==========================================
# ADMIN/MAINTENANCE ENDPOINT (Postman test)
# ==========================================

@router.post("/admin/lock-expired-exams")
def lock_expired_exams(
    current_user=Depends(require_role("Admin", "Teacher")),
    conn=Depends(get_sql_conn)
):
    """
    [ADVANCED DB] Gọi Stored Procedure sp_LockExpiredSubmissions.
    SP tự động quét và khóa (Locked) các Submission Pending của bài thi quá hạn.
    Endpoint này có thể test trực tiếp qua Postman bằng token Teacher hoặc Admin.
    """
    try:
        result = conn.execute(text("EXEC dbo.sp_LockExpiredSubmissions")).fetchone()
        conn.commit()
        return {
            "message": "Expired submissions locked successfully",
            "lockedCount": result.LockedSubmissions if result else 0
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
