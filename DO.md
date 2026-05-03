# Kế hoạch Triển khai Hệ thống (DO.md)

Tài liệu này liệt kê các công việc cần thực hiện để biến các bản thiết kế (SCREEN, SPECIFICATION, DATABASE) thành một dự án thực tế hoàn chỉnh, kết hợp Frontend (React), Backend (Python) và Database (SQL Server + MongoDB). Mục tiêu cuối cùng là tạo ra một demo thể hiện rõ ràng các kiến thức của môn học Hệ cơ sở dữ liệu nâng cao (đặc biệt là tính năng Polyglot Persistence).

## Hoàn thiện Hệ thống (Bug Fixing & Data Enrichment Phase)
*(Khắc phục các lỗi hiện tại và làm phong phú dữ liệu)*

- [ ] **1. Mở rộng Dữ liệu mẫu (Seed Data):**
  - [ ] **SQL Server:** Cập nhật script `2_seed_data.sql` tạo 1 Admin, 1 Teacher, 6 Students (có sinh viên đã tham gia nhóm, có sinh viên chưa được mời). Tạo 2 Groups, nhiều bài kiểm tra (Exams) với đầy đủ các trạng thái (Pending, Graded, Locked).
  - [ ] **MongoDB (NoSQL):** Cập nhật script khởi tạo hoặc thêm cơ chế seed tự động cho MongoDB để đồng bộ các ID bài thi và chứa câu hỏi, câu trả lời (answers) tương ứng với dữ liệu bên SQL.
- [ ] **2. Sửa lỗi Frontend - Luồng Sinh viên (Student Role):**
  - [ ] Khắc phục lỗi khi nhấn nút "Do" (Làm bài) ở màn hình chi tiết nhóm, đảm bảo chuyển hướng (redirect) chính xác sang màn hình làm bài (`Quiz` hoặc `Essay`).
- [ ] **3. Sửa lỗi & Hoàn thiện luồng Giáo viên (Teacher Role):**
  - [ ] Sửa lỗi không thể tạo bài kiểm tra (Exam) mới.
  - [ ] Sửa biểu đồ phân tích (Analytics Charts): Thay thế mock data bằng dữ liệu thật lấy từ Database (đã được tính toán qua Aggregation Pipeline của MongoDB).
  - [ ] Chuẩn hóa thang điểm: Đảm bảo tổng số điểm tối đa của mọi bài thi (Trắc nghiệm hoặc Tự luận) luôn hiển thị ở hệ số 10 (chứ không phải 100 hay các con số khác).

