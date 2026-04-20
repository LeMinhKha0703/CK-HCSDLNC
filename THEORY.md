# Tổng quan Hệ quản trị Cơ sở dữ liệu Nâng cao

Dưới đây là tổng quan thuần túy về mặt học thuật và lý thuyết của môn học Hệ quản trị Cơ sở dữ liệu Nâng cao (Advanced Database Systems).

## Phần 1: SQL Nâng cao và Lý thuyết Xử lý Giao dịch (Transaction Processing)

* **Kỹ thuật Truy vấn Phức hợp:** Sử dụng các loại JOIN (Inner, Outer, Cross, Self), Subqueries và CTEs (Common Table Expressions) để cấu trúc hóa logic truy vấn. Áp dụng Window Functions (như ROW_NUMBER(), RANK(), LEAD(), LAG()) để phân tích tính toán trên các tập hợp cửa sổ dữ liệu mà không làm gộp dòng như GROUP BY.
* **Thuộc tính ACID:** Đảm bảo độ tin cậy của giao dịch bằng 4 tính chất: Nguyên tử (Atomicity), Nhất quán (Consistency), Cách ly (Isolation) và Bền vững (Durability).
* **Kiểm soát Đồng thời và Các dị thường (Concurrency Anomalies):** Nhận diện các vấn đề khi xử lý đồng thời như Dirty Read, Non-repeatable Read, Phantom Read và Lost Update.
* **Các mức độ Cô lập (Isolation Levels):** Phân tích sự đánh đổi giữa hiệu suất và tính nhất quán qua các mức độ: Read Uncommitted, Read Committed, Repeatable Read, và Serializable.

## Phần 2: Lập trình Cơ sở dữ liệu (Database Programming)

* **Kiến trúc Bộ nhớ:** Hiểu rõ cấu trúc phân tầng vật lý và logic, bao gồm System Global Area (SGA) và Program Global Area (PGA) trong hệ quản trị CSDL.
* **Cấu trúc Lập trình (PL/SQL & T-SQL):** Cấu trúc khối lập trình chuẩn (DECLARE, BEGIN, EXCEPTION, END). Sử dụng cấu trúc rẽ nhánh và vòng lặp, cùng cơ chế tham chiếu kiểu dữ liệu tự động (%TYPE).
* **Xử lý Cursor:** Phân biệt Implicit và Explicit Cursors. Quy trình mở, nạp dữ liệu tuần tự và đóng cursor để xử lý dữ liệu row-by-row, tối ưu bằng CURSOR FOR LOOP. Tránh bẫy hiệu suất (N+1 Problem) khi lồng ghép cursor.
* **Subprograms và Triggers:**
    * **Stored Procedures & Functions:** Đóng gói logic nghiệp vụ; nhận diện sự khác biệt về yêu cầu trả về giá trị giữa Function và Procedure.
    * **Triggers:** Cơ chế kích hoạt tự động dựa trên sự kiện DML (INSERT, UPDATE, DELETE). Nhận diện các khác biệt giữa mức độ Statement và Row, cũng như cách xử lý lỗi "Mutating Table".
* **Xử lý Lỗi và SQL Động (Dynamic SQL):** Kỹ thuật bẫy lỗi bằng block EXCEPTION và sử dụng EXECUTE IMMEDIATE kết hợp với biến liên kết (bind variables) để ngăn chặn SQL Injection.

## Phần 3: Động cơ Lưu trữ và Kiến trúc Dữ liệu Lớn (Big Data Foundations)

* **Cơ chế lưu trữ Vật lý (Storage Engines):**
    * **B-Tree:** Tối ưu hóa cho các thao tác đọc ngẫu nhiên (random reads) và cập nhật tại chỗ (in-place updates).
    * **LSM-Tree:** Tối ưu hóa cho tốc độ ghi cực cao thông qua cơ chế ghi nối tiếp tuần tự (append-only).
* **Mô hình Lưu trữ Dữ liệu Phân tích:** Đánh giá hiệu suất I/O và khả năng nén giữa lưu trữ định hướng hàng (Row-oriented) cho các giao dịch và định hướng cột (Column-oriented) cho phân tích.
* **Chiến lược Phân mảnh (Sharding):** Đánh đổi giữa Hash-Based (phân phối đều, tránh điểm nóng) và Range-Based (tối ưu cho truy vấn khoảng, nhưng dễ gặp nghẽn điểm nóng).
* **Tiến hóa Lược đồ (Schema Evolution):** Các nguyên tắc đảm bảo tính tương thích ngược (Backward) và tương thích xuôi (Forward) trong hệ thống phân tán.

## Phần 4: Phân tích 4 Mô hình Cơ sở Dữ liệu Cốt lõi

* **Mô hình Quan hệ (Relational/SQL):** Đặc trưng bởi "Schema-on-write", khóa chính (PK), khóa ngoại (FK), và lý thuyết chuẩn hóa (Normalization). Tập trung tuyệt đối vào tính toàn vẹn dữ liệu.
* **Mô hình Tài liệu (Document/MongoDB):** Tổ chức dữ liệu dưới dạng JSON/BSON linh hoạt, phân cấp cấu trúc. Cho phép hai chiến lược mô hình hóa là Nhúng (Embedding) và Tham chiếu (Referencing). Áp dụng quy tắc lập chỉ mục ESR (Equality, Sort, Range), Pipeline tổng hợp dữ liệu (Aggregation) và các toán tử mảng ($all, $elemMatch, $unwind).
* **Mô hình Đồ thị (Graph/Neo4j):** Tập trung vào Node, Edge và Properties. Đặc trưng bởi Index-Free Adjacency, cho phép độ phức tạp thời gian luôn là O(1) bất kể kích thước CSDL khi duyệt các mối quan hệ.
* **Mô hình Key-Value (Redis):** Dựa trên cấu trúc từ điển (Dictionary/Hash). Tốc độ tra cứu là O(1), thiết kế phẳng không có lược đồ, dữ liệu dạng "opaque blob" (hệ thống không quan tâm nội dung bên trong value).

## Phần 5: Kiến trúc Hệ thống Hiện đại và Triển khai Đa ngữ (Polyglot Architecture)

* **Polyglot Persistence:** Triết lý kiến trúc sử dụng nhiều loại CSDL chuyên biệt trong cùng một ứng dụng (Ví dụ: SQL cho tính toàn vẹn, Document cho cấu trúc động, Key-Value cho bộ đệm, Graph cho hệ thống liên kết).
* **Đồng bộ Hệ thống và Xử lý sự kiện:** Triển khai luồng kiến trúc qua kỹ thuật Change Data Capture (CDC) và Streaming để duy trì trạng thái nhất quán giữa các loại CSDL khác nhau.
* **Giải pháp cho CSDL Phân tán:** Quản lý giao dịch đa cơ sở dữ liệu qua Data Snapshots và mô hình luồng phân tán (Saga Pattern). Xử lý giới hạn mạng qua định lý CAP và PACELC (lựa chọn giữa Availability và Consistency).
* **Tích hợp Công nghệ Trí tuệ Nhân tạo (SOTA AI):** Ứng dụng Vector Search ngay trong các lõi DB truyền thống, sử dụng mô hình GraphRAG kết hợp Knowledge Graph để chống ảo giác mô hình AI, và cấu trúc lưu trữ kết hợp JSON-Relational Duality.