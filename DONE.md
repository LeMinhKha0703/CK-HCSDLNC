# Project Status: E-learning Analytics System

Tài liệu này ghi lại toàn bộ tiến độ dự án, cấu trúc mã nguồn và lộ trình tiếp theo để các Agent/Developer có thể nắm bắt nhanh.

## 1. Tổng quan kiến trúc (Architecture)
Hệ thống sử dụng kiến trúc **Polyglot Persistence** (Đa lưu trữ):
- **SQL Server**: Lưu trữ dữ liệu quan hệ, metadata bài thi, thông tin người dùng, điểm số tổng hợp.
- **MongoDB**: Lưu trữ dữ liệu phi cấu trúc, nội dung câu hỏi chi tiết, nội dung bài làm chi tiết của sinh viên.
- **Backend**: FastAPI (Python) - Đóng vai trò điều phối dữ liệu giữa 2 DB.
- **Frontend**: React (Vite + TypeScript) - Giao diện người dùng hiện đại, premium.

## 2. Cấu trúc thư mục (Project Structure)
```text
CK-HCSDLNC/
├── BE/                      # Backend FastAPI
│   ├── routes/              # Các Endpoint chia theo module (auth, student, teacher, admin)
│   ├── main.py              # Entry point của ứng dụng
│   ├── database.py          # Cấu hình kết nối SQL Server (SQLAlchemy) & MongoDB (Motor)
│   ├── auth.py              # Xử lý JWT & Phân quyền (RBAC)
│   ├── models.py            # Pydantic Schemas cho API
│   └── .env                 # Biến môi trường (DB Connection, Secret Key)
├── FE/                      # Frontend React
│   ├── src/
│   │   ├── api/             # Axios Client & API functions (Interceptors đính kèm JWT)
│   │   ├── components/
│   │   │   ├── common/      # ProtectedRoute, ExamSidebar
│   │   │   ├── student/     # Giao diện Sinh viên (Đã TSX & API)
│   │   │   ├── teacher/     # Giao diện Giảng viên (Đã TSX & API)
│   │   │   └── sidebar/     # Sidebars linh hoạt theo Role
│   │   ├── context/         # AuthContext quản lý Login/Session
│   │   ├── App.tsx          # Routing trung tâm chuẩn theo SCREEN.md
│   │   └── main.tsx         # Bọc Provider
├── docker-compose.yml       # Chạy SQL Server, MongoDB & (BE tương lai)
├── sql-init/                # Script nạp Schema & Data mẫu cho SQL Server
├── APIADDRESS.md            # Danh sách chi tiết các API endpoints
├── SCREEN.md                # Đặc tả giao diện & Routing
└── DONE.md                  # File này - Trạng thái dự án
```

## 3. Những gì ĐÃ làm được (What's Done)

### Phase 1 & 2: Infrastructure & Backend
- [x] **Docker Setup**: Chạy đồng thời SQL Server & MongoDB. Tự động nạp Schema & Seed dữ liệu.
- [x] **Database connection**: Kết nối đồng bộ 2 loại DB trong cùng 1 request (Distributed Transaction).
- [x] **Authentication**: JWT Auth hoàn thiện. Middleware `require_role` bảo vệ API.
- [x] **Business Logic**: 
    - Tạo bài thi: Ghi SQL (Meta) -> Ghi Mongo (Questions).
    - Nộp bài: Lưu bài làm vào Mongo -> Cập nhật trạng thái SQL.
    - Chấm bài: Ghi điểm chi tiết vào Mongo -> Tính tổng ghi vào SQL.

### Phase 3: Frontend Integration (Student Focus)
- [x] **API Client**: Axios instance tích hợp Interceptor (Tự động đính kèm token, handle 401).
- [x] **Routing**: `App.tsx` đã cấu hình toàn bộ Routes chuẩn theo `SCREEN.md`.
- [x] **Auth Flow**: `AuthForm.tsx` đã kết nối API Login/Register, tự động chuyển trang theo Role.
- [x] **Student Role (100% complete)**:
    - `Dashboard.tsx`: Lấy danh sách nhóm thực từ BE.
    - `GroupDetail.tsx`: Hiển thị thông tin nhóm, danh sách bài thi (Do/Graded/Locked).
    - `Quiz.tsx`: Làm bài trắc nghiệm thực, nộp bài về BE.
    - `Essay.tsx`: Làm bài tự luận (Rich text editor), nộp bài về BE.
    - `Notifications.tsx`: Nhận thông báo mời vào nhóm & nút Accept thực thụ.

## 4. Những gì CHƯA làm được (What's Next)

### Phase 4: Teacher & Admin FE Integration (100% complete)
- [x] **Teacher Module**:
    - `GroupManagement.tsx`: API Fetch/Create Groups, Invite students thực tế.
    - `ExamManagement.tsx`: API Fetch Exams, Dashboard Stats tổng hợp từ BE.
    - `GroupDetails.tsx`: API Fetch Students & Performance Stats.
    - `GradeEssay.tsx`: Kết nối API chấm điểm thực, lưu kết quả vào SQL/Mongo.
- [x] **Admin Module**:
    - `Admin.tsx`: CRUD User thực tế (Search, Filter Role, Pagination).
    - `CreateUser.tsx`: Tạo tài khoản mới trực tiếp vào DB qua API.
- [x] **Analytics & UI Polish**:
    - Tích hợp `Recharts` hiển thị biểu đồ phân bổ điểm và hiệu suất câu hỏi.
    - Chuyển đổi 100% Codebase sang TypeScript (`.tsx`), xóa bỏ hoàn toàn `.jsx`.

## 4. Những gì CHƯA làm được (What's Next)

- [ ] **Deployment**: Triển khai lên Cloud (AWS/Vercel) hoặc hoàn thiện Docker Compose cho Production.
- [ ] **Stress Test**: Chạy script nạp 10,000+ records để demo sức mạnh của Indexed Views & Mongo Aggregation.
- [ ] **Advanced Features**: Xuất báo cáo PDF, AI gợi ý nhận xét bài làm Essay.

## 5. Lưu ý cho Agent tiếp theo
- **Base URL**: Backend chạy tại `http://localhost:8000`.
- **JWT**: Token được lưu trong `localStorage` dưới key `access_token`.
- **TypeScript**: Luôn chạy `npx tsc --noEmit` để kiểm tra lỗi Type trước khi kết thúc task.
- **Routing**: Phải tuân thủ `SCREEN.md`. Nếu thay đổi URL trong `App.tsx`, hãy cập nhật tài liệu.
