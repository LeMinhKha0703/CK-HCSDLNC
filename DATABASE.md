# Thiết kế Cơ sở dữ liệu (Polyglot Persistence)

Để tối ưu hóa cả tính toàn vẹn dữ liệu và hiệu năng truy vấn cho dữ liệu lớn/phức tạp, hệ thống áp dụng thiết kế đa ngôn ngữ CSDL. 
Nguyên tắc: **SQL Server** chịu trách nhiệm cho dữ liệu cấu trúc, quan hệ và định danh; **MongoDB** chịu trách nhiệm cho các dữ liệu văn bản lớn, mảng dữ liệu (như nội dung câu hỏi, chi tiết bài làm) và phục vụ phân tích (Analytics).

## 1. Cơ sở dữ liệu Quan hệ (SQL Server)

SQL Server đóng vai trò là "Core Database", quản lý các thực thể chính, trạng thái và điểm số tổng để đảm bảo ACID.

### Thiết kế Bảng (Tables)
* **Users:** Lưu thông tin tài khoản dùng chung.
  * `UserID` (PK, GUID), `FullName`, `Email` (Unique, Indexed), `PasswordHash`, `Role` (Student, Teacher, Admin), `CreatedAt`.
* **Groups:** Thông tin nhóm học do Giảng viên quản lý.
  * `GroupID` (PK), `TeacherID` (FK -> Users), `GroupName`, `TotalStudent`, `CreatedAt`.
* **Group_Students:** Bảng trung gian quản lý danh sách sinh viên trong nhóm.
  * `GroupID` (FK), `StudentID` (FK), `JoinedDate`. (Composite PK: GroupID, StudentID).
* **Notifications:** Quản lý thông báo và lời mời.
  * `NotifID` (PK), `UserID` (FK), `Title`, `Content`, `Type` (Invite_Group, Normal), `TargetID` (VD: GroupID khi mời nhóm), `IsRead`, `SendDate`.
* **Exams:** Lưu Metadata của bài kiểm tra. Tuyệt đối không lưu nội dung câu hỏi ở đây.
  * `ExamID` (PK, GUID), `GroupID` (FK), `Title`, `Type` (Essay, MCQ), `TotalQuestions`, `CreatedAt`, `EndAt`.
* **Submissions:** Lưu siêu dữ liệu bài nộp và điểm tổng (Phục vụ truy vấn nhanh danh sách cho Teacher và Rank cho Student).
  * `SubmissionID` (PK, GUID), `ExamID` (FK), `StudentID` (FK), `TotalScore`, `Status` (Pending, Graded, Locked), `SubmitedAt`.

### Tối ưu Hiệu năng (SQL Server)
* Sử dụng **Indexed Views** để tính toán **Average Grade** và **Rank Position** của sinh viên trong một Group. Thay vì phải tính lại điểm trên toàn bộ bảng Submissions mỗi khi sinh viên truy cập Dashboard, View này sẽ duy trì kết quả tính toán sẵn.

## 2. Cơ sở dữ liệu Document (MongoDB)

MongoDB đóng vai trò lưu trữ toàn bộ các cấu trúc phức tạp, dữ liệu lồng nhau mà nếu dùng SQL sẽ cần phải JOIN nhiều bảng (Question, Option, CorrectAnswer, StudentAnswer, AnswerScore, v.v.).

### Thiết kế Collections

Hai Collection dưới đây sẽ sử dụng `_id` đồng nhất với `ExamID` và `SubmissionID` được sinh ra từ SQL Server để làm cầu nối.

* **Exam_Questions** (Nội dung Đề thi)
  Sử dụng để lấy toàn bộ nội dung đề thi ngay lập tức cho sinh viên mà không cần JOIN bất kỳ bảng nào.
  ```json
  {
    "_id": "ExamID", // Sinh ra từ bảng Exams (SQL)
    "questions": [
      {
        "questionId": 1, // Thứ tự câu hỏi
        "content": "Nội dung câu hỏi trắc nghiệm / tự luận",
        "options": ["A", "B", "C", "D"], // Chỉ áp dụng cho MCQ
        "correctAnswer": "A" // Chỉ áp dụng cho MCQ
      }
    ]
  }
  ```

* **Submission_Answers** (Chi tiết Bài làm)
  Chứa chi tiết câu trả lời của sinh viên. Nếu là Tự luận, Giảng viên sẽ cập nhật field `score` cho từng object trong mảng.
  ```json
  {
    "_id": "SubmissionID", // Sinh ra từ bảng Submissions (SQL)
    "examId": "ExamID",
    "studentId": "StudentID",
    "answers": [
      {
        "questionId": 1,
        "studentResponse": "A", // (MCQ) hoặc nội dung tự luận (Essay)
        "isCorrect": true, // (MCQ) Hệ thống tự chấm
        "score": 10 // (Essay) Teacher chấm điểm
      }
    ]
  }
  ```

### Tối ưu Analytics (MongoDB)
Để vẽ 2 biểu đồ cho Giảng viên trên `SCREEN.md` (**Average Score per Question** và **Question Performance**), hệ thống tận dụng **Aggregation Pipeline** trực tiếp trên collection `Submission_Answers` thay vì đè nặng lên SQL.
* **Đối với MCQ (Question Performance):** Dùng `$match` theo `examId`, sau đó `$unwind` mảng `answers`, rồi `$group` theo `questionId` để đếm tổng số document có `isCorrect: true`.
* **Đối với Essay (Average Score per Question):** Tương tự, `$unwind` mảng `answers`, `$group` theo `questionId` và dùng hàm `$avg` để tính điểm trung bình dựa trên field `score` mà giáo viên đã chấm.