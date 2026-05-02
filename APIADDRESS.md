# Danh sách API Address (Backend)

Dưới đây là danh sách toàn bộ các RESTful API được thiết kế dựa trên các màn hình chức năng (`SCREEN.md`) và luồng hệ thống. Tài liệu này là "bản lề" để chúng ta code các chức năng trong thư mục BE.

## 1. Authentication (`/api/auth`)
* `POST /api/auth/login`
  * Body: `{ "email": "...", "password": "..." }`
  * Response: `{ "access_token": "...", "role": "Student/Teacher/Admin", "fullName": "..." }`
* `POST /api/auth/register`
  * Body: `{ "fullName": "...", "email": "...", "password": "...", "isTeacher": true/false }`

## 2. Student (`/api/student`)
* `GET /api/student/groups` (Dashboard)
  * Lấy danh sách các nhóm đã tham gia (Kèm điểm trung bình và thứ hạng lấy từ Indexed View `vw_StudentGroupScore`).
* `GET /api/student/groups/{groupId}`
  * Lấy chi tiết nhóm và danh sách bài kiểm tra.
* `GET /api/student/exams/{examId}`
  * Lấy cấu trúc đề thi (Nội dung câu hỏi từ MongoDB `Exam_Questions` + Metadata từ SQL Server).
* `POST /api/student/exams/{examId}/submit`
  * Nộp bài (Lưu chi tiết mảng câu trả lời vào MongoDB `Submission_Answers`, lưu `TotalScore` vào SQL `Submissions`).
* `GET /api/student/notifications`
  * Xem danh sách thông báo lời mời.
* `POST /api/student/notifications/{notifId}/accept`
  * Chấp nhận lời mời vào nhóm.

## 3. Teacher (`/api/teacher`)
* `GET /api/teacher/dashboard`
  * Thống kê tổng quan (Tổng số bài tập, Trắc nghiệm, Tự luận).
* `GET /api/teacher/groups`
  * Quản lý danh sách nhóm do giáo viên tạo.
* `POST /api/teacher/groups`
  * Tạo nhóm học mới.
* `GET /api/teacher/groups/{groupId}`
  * Lấy danh sách sinh viên trong nhóm, lọc sinh viên (Grade <5.0, >8.0).
* `POST /api/teacher/groups/{groupId}/invite`
  * Gửi lời mời sinh viên vào nhóm.
* `GET /api/teacher/exams`
  * Lấy danh sách tất cả các bài kiểm tra do giáo viên quản lý.
* `POST /api/teacher/exams` **(Polyglot Persistence Route)**
  * Tạo bài kiểm tra. Backend thực thi: Lưu Metadata vào SQL Server -> Lấy `ExamID` -> Lưu cấu trúc câu hỏi vào MongoDB. (Có Rollback nếu lỗi).
* `GET /api/teacher/exams/{examId}`
  * Chi tiết bài kiểm tra. Trả về Data biểu đồ **lấy từ MongoDB Aggregation** (Question Performance hoặc Average Score).
* `GET /api/teacher/exams/{examId}/submissions/{submissionId}`
  * Xem chi tiết bài làm của sinh viên (Từ MongoDB).
* `POST /api/teacher/exams/{examId}/submissions/{submissionId}/grade`
  * Chấm điểm bài Tự luận. (Cập nhật `score` ở MongoDB và `TotalScore` ở SQL Server).

## 4. Admin (`/api/admin`)
* `GET /api/admin/users`
  * Lấy danh sách Users (có filter).
* `POST /api/admin/users`
  * Tạo User mới.
* `PUT /api/admin/users/{userId}`
  * Sửa thông tin User.
* `DELETE /api/admin/users/{userId}`
  * Xóa tài khoản User.
