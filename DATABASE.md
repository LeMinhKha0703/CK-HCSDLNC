# 1. Phân tích thiết kế Relational Database (SQL Server)

Với SQL Server, chiến lược là **Chuẩn hóa dữ liệu (Normalization)** để đảm bảo tính toàn vẹn (ACID) và sử dụng **Indexing/Views** để tăng tốc độ truy vấn phân tích.

## Thiết kế Bảng (Tables)

* **Users:** Lưu thông tin tài khoản dùng chung.
  * `UserID` (PK), `FullName`, `Email` (Unique, Indexed), `PasswordHash`, `Role` (Student, Teacher, Admin).
* **Groups:** Nhóm học.
  * `GroupID` (PK), `TeacherID` (FK -> Users), `GroupName`, `TotalStudent`, `CreatedAt`.
* **Group_Students:** Bảng trung gian (Many-to-Many).
  * `GroupID` (FK), `StudentID` (FK), `JoinedDate`. (Composite PK: GroupID, StudentID).
* **Notifications:** Lưu lời mời vào nhóm.
  * `NotifID` (PK), `UserID` (FK), `Title`, `Content`, `Type` (Invite_Group, normal), `SendDate`.
* **Exams:** Thông tin bài kiểm tra.
  * `ExamID` (PK), `GroupID` (FK), `Title`, `Type` (Essay, MCQ), `TotalQuestions`, `CreatedAt`, `EndAt`.
* **Questions:** Chi tiết từng câu hỏi (phục vụ tính toán tỷ lệ thất bại).
  * `QuestionID` (PK), `ExamID` (FK), `Content`, `CorrectAnswer`.
* **Submissions:** Lưu kết quả làm bài.
  * `SubmissionID` (PK), `ExamID` (FK), `StudentID` (FK), `TotalScore`, `Status` (Pending, Graded, Locked), `SubmitedAt`.
* **Submission_Details:** Lưu câu trả lời chi tiết của sinh viên.
  * `DetailID` (PK), `SubmissionID` (FK), `QuestionID` (FK), `StudentAnswer`, `IsCorrect` (Bit: 1 đúng, 0 sai).
* **Materials:** Tài liệu bổ trợ.
  * `MaterialID` (PK), `GroupID` (FK), `FileURL/Content`.

## Chiến lược Tối ưu Hiệu năng (SQL Server)

* **B-Tree Indexing:** Tạo Non-clustered index trên các cột thường xuyên được truy vấn lọc như `Role` trong Users, `GroupID` trong Exams và Submissions.
* **Indexed Views (Materialized Views) cho Analytics:** * Nghiệp vụ "Xác định sinh viên có nguy cơ" đòi hỏi tính điểm trung bình liên tục. Việc JOIN và tính `AVG()` trực tiếp trên bảng Submissions lớn sẽ gây chậm hệ thống.
  * Giải pháp là tạo một Indexed View `vw_StudentGroupAverageScore` lưu sẵn kết quả tổng hợp `StudentID`, `GroupID`, `AverageScore`.
  * Khi giảng viên truy cập, hệ thống chỉ cần query trực tiếp từ View này và `ORDER BY AverageScore ASC LIMIT 10`.
* **Query Optimization cho "Tỷ lệ thất bại":** Sử dụng Window Functions hoặc `GROUP BY` trên bảng `Submission_Details` kết hợp điều kiện `IsCorrect = 0` để nhanh chóng đếm số lượng trả lời sai trên tổng số lượt trả lời của từng `QuestionID`.


# 2. Phân tích thiết kế Document Database (MongoDB)

Với MongoDB, chiến lược là **Khử chuẩn (Denormalization)** và **Nhúng dữ liệu (Embedding)**.
Chúng ta sẽ gom các dữ liệu thường được đọc cùng nhau vào chung một Document để giảm thiểu thao tác JOIN (Lookup), tối đa hóa tốc độ đọc (Read IOPS).

## Thiết kế Collections

* **users:**
  `{ _id, email, password, role, createdAt }`
* **groups:** Lưu trữ thông tin nhóm và danh sách thành viên (Mảng tham chiếu).
  `{ _id, teacherId, name, studentIds: [ObjectId], materials: [{ title, url }] }`
* **notifications:**
  `{ _id, userId, content, isRead, type, metadata: { groupId } }`
* **exams:** Nhúng trực tiếp danh sách câu hỏi vào bài kiểm tra vì chúng luôn được truy xuất cùng lúc khi sinh viên mở bài.
  `{ _id, groupId, title, type, questions: [ { questionId, content, options, correctAnswer } ] }`
* **submissions:** Nhúng trực tiếp bài làm chi tiết vào kết quả.
  `{ _id, examId, studentId, groupId, score, status, answers: [ { questionId, studentAnswer, isCorrect } ] }`

**Lưu ý:** Việc thêm field `groupId` (dù hơi dư thừa so với việc query ngược qua `examId`) là một kỹ thuật khử chuẩn giúp query phân tích điểm theo nhóm học nhanh hơn rất nhiều.

## Chiến lược Tối ưu Hiệu năng (MongoDB)

* **Compound Indexes:**
  * Tạo index `{ groupId: 1, studentId: 1 }` trên collection `submissions` để truy xuất toàn bộ điểm của một sinh viên trong một nhóm cực kỳ nhanh chóng.
  * Tạo index `{ groupId: 1, score: 1 }` trên `submissions` phục vụ cho việc tìm Top 10 điểm thấp nhất.
* **Aggregation Pipeline cho Analytics:**
  * **Top 10 nguy cơ:** Dùng `$match` lọc theo `groupId`, sau đó `$group` theo `studentId` để tính `$avg` score, cuối cùng `$sort` tăng dần và `$limit: 10`.
  * **Phân tích độ khó câu hỏi:** Sử dụng `$unwind` mảng `answers` trong `submissions`, sau đó `$group` theo `questionId` để đếm tổng số lần trả lời và số lần `isCorrect: false`. Tính tỷ lệ phần trăm trực tiếp trong pipeline. Nhờ cấu trúc document, thao tác này chạy trực tiếp trên memory mà không cần Disk I/O nặng nề để join bảng.