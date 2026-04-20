# Tài liệu Đặc tả Hệ thống Quản lý Học tập & Kiểm tra (Advanced Database Systems)

Tài liệu này quy định các chức năng cốt lõi cho hệ thống quản trị học tập, tập trung vào việc tương tác giữa Giảng viên, Sinh viên và quản trị viên hệ thống.

## 1. Phân hệ Sinh viên (Student)

* **Tạo tài khoản:** Người dùng đăng ký tài khoản mới trên hệ thống. Vai trò (Role) mặc định khi đăng ký thành công là **Sinh viên**.
* **Quản lý lời mời:** * Nhận lời mời tham gia nhóm học từ Giảng viên thông qua phân hệ **Thông báo**.
    * Sau khi chấp nhận, sinh viên có quyền truy cập vào các bài kiểm tra của nhóm đó.
* **Tương tác Bài kiểm tra:**
    * Thực hiện bài kiểm tra trắc nghiệm: Hệ thống tự động chấm điểm dựa trên đáp án đã thiết lập và lưu kết quả ngay lập tức.
    * Thực hiện bài kiểm tra tự luận: Hệ thống ghi nhận bài làm; điểm số sẽ được cập nhật sau khi Giảng viên chấm thủ công.
* **Theo dõi kết quả cá nhân:**
    * Xem điểm trung bình (GPA) của từng nhóm học tham gia.
    * Xem thứ hạng (Rank) của bản thân trong nhóm học đó.
    * Xem chi tiết điểm của từng bài kiểm tra cụ thể khi nhấp vào điểm trung bình của nhóm.

## 2. Phân hệ Giảng viên (Teacher)

* **Tạo tài khoản:** Người dùng đăng ký tài khoản và tích chọn tùy chọn "Tôi là Giảng viên".
* **Quản lý nhóm & Mời sinh viên:**
    * Gửi lời mời trực tiếp cho sinh viên đã có trên hệ thống.
    * Hỗ trợ nhập danh sách sinh viên hàng loạt thông qua tệp Excel (Định dạng: STT, Email đăng ký).
* **Quản lý bài kiểm tra:**
    * Khởi tạo bài kiểm tra mới với hai hình thức: Trắc nghiệm hoặc Tự luận.
    * Đăng tải bài kiểm tra lên hệ thống cho các nhóm học tương ứng.
* **Chấm điểm tự luận:** Truy cập vào danh sách bài làm tự luận của sinh viên, nhập điểm và lưu vào hệ thống.
* **Phân tích và Giám sát:**
    * **Xác định sinh viên có nguy cơ:** Truy cập bảng điểm trung bình toàn nhóm, hệ thống tự động lọc Top 10 sinh viên có điểm thấp nhất (hiển thị dòng màu đỏ trên UI).
    * **Phân tích độ khó:** Xem báo cáo về tỷ lệ thất bại (tỷ lệ trả lời sai) của từng câu hỏi cụ thể trong bài kiểm tra.
    * **Xuất báo cáo:** Hỗ trợ xuất các danh sách điểm và báo cáo phân tích ra tệp Excel.
* **Hỗ trợ giảng dạy:** Đăng tải tài liệu bổ trợ lên hệ thống dựa trên kết quả phân tích học tập của sinh viên.

## 3. Phân hệ Quản trị viên (Admin)

* **Thông tin đăng nhập mặc định:**
    * **Tài khoản:** `Admin`
    * **Mật khẩu:** `Admin`
* **Quản lý người dùng:**
    * Xem toàn bộ danh sách tài khoản trong hệ thống.
    * Thực hiện các quyền quản trị cao nhất: Thêm mới, Sửa thông tin và Xóa tài khoản.

## 4. Ghi chú Kỹ thuật (Gợi ý)

* **Cơ sở dữ liệu:** * Sử dụng **SQL Server** để đảm bảo tính toàn vẹn dữ liệu (ACID) cho các giao dịch quan trọng như chấm điểm và quản lý người dùng.
    * Sử dụng **MongoDB** cho các cấu trúc dữ liệu linh hoạt như nội dung bài kiểm tra (nhúng câu hỏi vào đề) và lưu trữ kết quả chi tiết để tối ưu tốc độ đọc/ghi.
* **Kiến trúc:** Triển khai theo mô hình **Polyglot Persistence** để tận dụng thế mạnh của cả hai loại CSDL trong cùng một hệ thống quản lý học tập nâng cao.