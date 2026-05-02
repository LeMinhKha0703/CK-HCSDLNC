# Tài liệu Đặc tả Hệ thống Quản lý Học tập & Kiểm tra

Tài liệu này quy định các chức năng cốt lõi cho hệ thống quản trị học tập, phân chia quyền hạn rõ ràng dựa trên giao diện hiển thị của 3 vai trò: Sinh viên (Student), Giảng viên (Teacher) và Quản trị viên (Admin).

## 1. Phân hệ Xác thực (Authentication)
* **Login (`.../login`):** Đăng nhập bằng Email và Password.
* **Register (`.../register`):** Đăng ký tài khoản mới (FullName, Email, Password). Có tùy chọn checkbox "I am a Teacher" để xác định vai trò, nếu không mặc định là Student.
* **Logout (`.../logout`):** Đăng xuất và điều hướng về trang Login.

## 2. Phân hệ Sinh viên (Student)
Giao diện mặc định sau khi đăng nhập là Dashboard nhóm học (`.../student/mygroups`).

* **Quản lý Nhóm học:**
  * Xem danh sách các nhóm đã tham gia (Tên nhóm, Tên giảng viên, Ngày tạo).
  * Truy cập vào chi tiết nhóm học: Theo dõi tổng quan Điểm trung bình (Average Grade) của tất cả bài kiểm tra và Thứ hạng (Rank Position) của bản thân trong nhóm.
* **Tương tác Bài kiểm tra (Exams):**
  * Trong chi tiết nhóm, sinh viên xem danh sách các bài kiểm tra (Title, Type: Essay/MCQ, Hạn chót EndAt).
  * **Trạng thái bài thi:**
    * Chưa làm: Hiển thị nút **Do** để bắt đầu làm bài.
    * Đã làm: Hiển thị **Final Score** (Điểm/10). Riêng tự luận chờ chấm sẽ hiển thị `_/10`.
    * Quá hạn (EndAt): Chuyển trạng thái **Locked**.
  * **Màn hình làm bài (`.../exams/essay` hoặc `.../exams/mcq`):**
    * Cung cấp thanh điều hướng câu hỏi (Question Navigator) trên Sidebar.
    * Hiển thị thời gian đếm ngược, nội dung câu hỏi.
    * Trắc nghiệm (MCQ): Cung cấp các nút Radio để chọn đáp án. Tự luận (Essay): Cung cấp trường nhập văn bản.
* **Thông báo (Notifications):**
  * Xem danh sách thông báo gồm tiêu đề và nội dung.
  * Hỗ trợ nút **Accept Invitation** trực tiếp trên thông báo loại mời vào nhóm. Sau khi chấp nhận sẽ tự động điều hướng vào nhóm đó.

## 3. Phân hệ Giảng viên (Teacher)
Giao diện mặc định sau khi đăng nhập là Quản lý Nhóm (`.../teacher/groupmanagement`).

* **Quản lý Nhóm học (Group Management):**
  * Thêm nhóm mới: Nhập tên nhóm, hỗ trợ **Upload Student List** qua tệp Excel (`.xlsx`) hoặc thêm thủ công bằng Email.
  * Bảng thống kê danh sách nhóm: Tên nhóm, Tổng số sinh viên, Ngày tạo.
  * Chi tiết nhóm (`.../teacher/group/{GroupName}`):
    * Lọc nhanh danh sách sinh viên theo tiêu chí: **Grade < 5.0** và **Grade > 8.0**.
    * Danh mục sinh viên (Student Directory): Hiển thị STT, Họ tên, Email, Điểm trung bình (Average Grade).
    * Bổ sung sinh viên: Mời thêm sinh viên vào nhóm (Upload Excel hoặc Email).
    * Tính năng **Export (Excel)**: Xuất toàn bộ danh sách, kèm các danh sách lọc (<5.0, >8.0).
* **Quản lý Bài kiểm tra (Exam Management):**
  * **Dashboard thống kê:** Xem tổng số lượng bài tập, tổng bài Trắc nghiệm (MCQ), tổng bài Tự luận (Essay).
  * Khởi tạo bài kiểm tra (`.../teacher/createexam`): Chọn Tên nhóm (thuộc quản lý của Teacher), Loại bài (MCQ/Essay), Tổng số câu hỏi.
  * Nhập nội dung câu hỏi: Nhập trực tiếp qua Form hoặc tải lên tệp Excel (hỗ trợ nhập cả câu hỏi, các đáp án và chỉ định đáp án đúng cho MCQ).
* **Phân tích và Chấm điểm (Analytics & Grading):**
  * Danh sách bài kiểm tra cho phép truy cập để xem chi tiết, xuất kết quả điểm ra tệp Excel.
  * **Tự luận (Essay):**
    * Xem biểu đồ **Average Score per Question**: Phân tích điểm trung bình của từng câu hỏi để đánh giá độ khó thực tế.
    * Danh sách nộp bài (Pending, Graded, Locked).
    * Hành động **Grade**: Chuyển đến màn hình chấm điểm, nhập điểm và lưu (Save Evaluation).
    * Hành động **Review**: Xem lại điểm đã chấm.
  * **Trắc nghiệm (MCQ):**
    * Xem biểu đồ **Question Performance**: Thống kê số lượng sinh viên chọn đúng cho từng câu hỏi.
    * Danh sách nộp bài (Pending, Graded, Locked).
    * Hành động **Review**: Màn hình xem chi tiết kết quả sinh viên so với đáp án đúng.

## 4. Phân hệ Quản trị viên (Admin)
Giao diện mặc định sau khi đăng nhập là Quản lý Người dùng (`.../admin/usermanagement`).

* **Quản lý Người dùng:**
  * Tìm kiếm và lọc người dùng theo Role (Teacher, Student).
  * **Tạo mới:** Màn hình `Create New User` (Họ tên, Email, Mật khẩu, System Role).
  * **Danh sách User:** Hiển thị thông tin cơ bản. Cho phép Edit (Họ tên, Email, Role) và Delete tài khoản trực tiếp.