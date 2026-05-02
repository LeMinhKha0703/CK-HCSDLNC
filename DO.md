# Kế hoạch Triển khai Hệ thống (DO.md)

Tài liệu này liệt kê các công việc cần thực hiện để biến các bản thiết kế (SCREEN, SPECIFICATION, DATABASE) thành một dự án thực tế hoàn chỉnh, kết hợp Frontend (React), Backend (Python) và Database (SQL Server + MongoDB). Mục tiêu cuối cùng là tạo ra một demo thể hiện rõ ràng các kiến thức của môn học Hệ cơ sở dữ liệu nâng cao (đặc biệt là tính năng Polyglot Persistence).

---

## 1. Thiết lập Cơ sở dữ liệu (DB Phase)
*(Đảm nhận việc xử lý dữ liệu và tối ưu hiệu năng theo kiến thức môn học)*

- [x] **SQL Server (Core Data & ACID):**
  - [x] Viết file script `init_sql.sql` để tạo database, các bảng (Users, Groups, Group_Students, Notifications, Exams, Submissions).
  - [x] Thiết lập Khóa chính (PK), Khóa ngoại (FK) và các Constraints (như Unique cho Email).
  - [x] **Advanced DB Feature:** Cài đặt **Indexed Views** (ví dụ `vw_StudentGroupAverageScore`) để tính sẵn Average Grade và Rank nhằm giảm tải N+1 query.
  - [x] Viết script Seed Data tạo sẵn tài khoản Admin, một vài Teacher và Student để test.
- [x] **MongoDB (Heavy Data & Analytics):**
  - [x] Khởi tạo Database và các collections: `Exam_Questions` và `Submission_Answers`.
  - [x] **Advanced DB Feature:** Cài đặt **Compound Indexes** trên các trường thường dùng để query (như `examId`, `studentId`).
  - [x] Chuẩn bị sẵn các mẫu **Aggregation Pipelines** (sẽ dùng ở Backend) để tính:
- [x] **Tích hợp Docker (Hạ tầng 1-Click):**
  - [x] Viết file `docker-compose.yml` để tự động kéo image và chạy toàn bộ hệ thống (SQL Server, MongoDB, và sau này là BE, FE).
  - [x] Thiết lập `sql-init` container để tự động run script SQL (`1_init_schema.sql` và `2_seed_data.sql`) ngay khi SQL Server boot xong.

## 2. Xây dựng Backend API (BE Phase - Python)
*(Đóng vai trò điều phối, phân luồng dữ liệu giữa SQL và MongoDB)*

- [x] **Khởi tạo & Cấu hình Project:**
  - [x] Thiết lập project Python dùng **FastAPI** với cấu trúc module (`main.py`, `database.py`, `auth.py`, `models.py`, `routes/`).
  - [x] Cài đặt thư viện kết nối DB: `SQLAlchemy + pymssql` cho SQL Server, `motor` (async) cho MongoDB. Khai báo trong `requirements.txt`.
- [x] **Thiết kế Middleware & Auth:**
  - [x] Triển khai JWT Token (`PyJWT`) cho Login/Register tại `auth.py`.
  - [x] Tạo dependency factory `require_role(*roles)` để kiểm tra phân quyền (Student, Teacher, Admin) trên từng route.
- [x] **Xây dựng hệ thống API:**
  - [x] **Auth:** `POST /api/auth/login`, `POST /api/auth/register` tại `routes/auth.py`.
  - [x] **Student:** Groups (Dashboard + Detail + kèm Rank/GPA), Exams (lấy đề từ Mongo), Submit bài, Notifications tại `routes/student.py`.
  - [x] **Teacher:** Dashboard, CRUD Groups, Invite, CRUD Exams, Grade submissions tại `routes/teacher.py`.
  - [x] **Admin:** CRUD Users với filter và search tại `routes/admin.py`.
- [x] **Advanced DB Feature (Polyglot Persistence Controller):**
  - [x] **Luồng Tạo Bài thi** (`POST /api/teacher/exams`): Lưu Metadata SQL trước → lấy `ExamID` → lưu câu hỏi chi tiết vào MongoDB với `_id = ExamID`. Có Rollback xóa SQL nếu Mongo lỗi. Xử lý cả MCQ (options, correctAnswer) và Essay (chỉ content).
  - [x] **Luồng Chấm thi** (`POST /api/teacher/exams/{id}/submissions/{id}/grade`): Cập nhật `score` từng câu vào MongoDB → tính tổng → cập nhật `TotalScore + Status=Graded` vào SQL.

## 3. Liên kết Frontend (FE Phase - React)
*(Đảm nhận hiển thị dữ liệu và biểu đồ phân tích)*

- [x] **Cấu hình API Client:**
  - [x] Trong folder `FE`, thiết lập `axios` instance với `baseURL` trỏ về Python BE.
  - [x] Cài đặt Interceptors để tự động đính kèm JWT Token vào Header của mọi request.
- [x] **Đồng bộ Giao diện với API:**
  - [x] **Login/Register:** Ghép API Auth, xử lý lưu token (LocalStorage/Cookies), phân hướng màn hình dựa theo Role sau khi đăng nhập.
  - [x] **Thiết kế Form phức tạp:** Form tạo bài kiểm tra (Teacher) có tính năng thêm danh sách câu hỏi động (Dynamic form) để gửi JSON data về BE.
  - [x] **Luồng làm bài (Student):** Hiển thị câu hỏi (Trắc nghiệm/Tự luận) lấy từ Mongo, thu thập đáp án từ UI và push JSON về API Submit.
- [x] **Vẽ Biểu đồ Phân tích (Analytics Charts):**
  - [x] Cài đặt thư viện biểu đồ (như `Chart.js` hoặc `Recharts`).
  - [x] Teacher xem báo cáo: Fetch data đã được tính toán sẵn từ API (nhờ Aggregation Pipeline của Mongo và Indexed View của SQL) để vẽ đồ thị: Điểm trung bình từng câu (Essay) và Tỷ lệ chọn đáp án đúng (MCQ).

## 4. Kiểm thử & Đánh giá Demo
- [ ] Tạo dữ liệu Mock (khoảng hàng ngàn submission) để test tốc độ query giữa việc dùng Aggregation của MongoDB so với việc dùng JOIN truyền thống của SQL Server, từ đó chứng minh được lý do áp dụng kiến trúc Polyglot Persistence trong môn Hệ CSDL Nâng cao.
