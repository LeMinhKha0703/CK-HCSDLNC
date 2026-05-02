# Project Status & Agent Handover Guide: E-learning Analytics System

Tài liệu này ghi lại toàn bộ tiến độ dự án, cấu trúc mã nguồn, hướng dẫn cài đặt và lộ trình tiếp theo. Nó được thiết kế đặc biệt để các Agent hoặc Developer khác có thể đọc hiểu và tiếp quản hệ thống một cách nhanh chóng.

## 1. Công nghệ & Công cụ (Tech Stack & Tools)
Hệ thống sử dụng kiến trúc **Polyglot Persistence** (Đa lưu trữ) kết hợp với các công nghệ hiện đại:
- **Backend:** Python, FastAPI, SQLAlchemy (tương tác SQL Server), Motor (tương tác MongoDB bất đồng bộ), PyJWT (Authentication).
- **Frontend:** React, Vite, TypeScript (100% `.tsx`), React Router DOM (Routing), Recharts (Vẽ biểu đồ), Lucide React (Icons), Tailwind CSS (Styling).
- **Databases:** 
  - **SQL Server:** Quản lý dữ liệu có cấu trúc quan hệ (Users, Groups, Metadata bài thi, Điểm số tổng hợp).
  - **MongoDB:** Quản lý dữ liệu phi cấu trúc và linh hoạt (Nội dung câu hỏi chi tiết, Bài làm của sinh viên).
- **Infrastructure:** Docker & Docker Compose để quản lý các Database Containers.

## 2. Cấu trúc hệ thống (Project Structure)
```text
CK-HCSDLNC/
├── BE/                      # Backend FastAPI
│   ├── routes/              # Các Endpoint chia theo module (auth, student, teacher, admin)
│   ├── main.py              # Entry point của ứng dụng (Khởi tạo FastAPI, CORS)
│   ├── database.py          # Cấu hình kết nối SQL Server & MongoDB
│   ├── auth.py              # Xử lý băm mật khẩu (SHA-256), tạo JWT & Phân quyền (RBAC)
│   ├── models.py            # Pydantic Schemas validate dữ liệu đầu vào/ra
│   └── .env                 # Biến môi trường (DB Connection, Secret Key)
├── FE/                      # Frontend React (Vite)
│   ├── src/
│   │   ├── api/             # Axios Client & API functions (Interceptors tự động đính kèm JWT)
│   │   ├── components/      # Chia nhỏ theo roles: common/, student/, teacher/, admin/
│   │   ├── context/         # AuthContext quản lý Global State của User/Session
│   │   ├── App.tsx          # Cấu hình Routing trung tâm chuẩn theo SCREEN.md
│   │   └── main.tsx         # Entry point, bọc các Provider
├── DB/SQL/                  # Chứa các scripts khởi tạo SQL
│   └── 2_seed_data.sql      # Seed data khởi tạo Admin/Teacher/Student mẫu (Đã mã hóa pass)
├── docker-compose.yml       # Cấu hình chạy SQL Server & MongoDB
├── APIADDRESS.md            # Tài liệu đặc tả API Endpoints
└── SCREEN.md                # Tài liệu đặc tả luồng UI & Routing Frontend
```

## 3. Hướng dẫn chạy hệ thống (How to Run)

### Bước 1: Khởi động Database (Docker)
Mở terminal tại thư mục gốc `CK-HCSDLNC` và chạy:
```bash
docker-compose up -d
```
- **SQL Server** sẽ chạy ở port `1433`. Password mặc định: `Your_Strong_Password_123`
- **MongoDB** sẽ chạy ở port `27017`.

### Bước 2: Khởi động Backend (FastAPI)
Mở terminal mới, di chuyển vào thư mục `BE`:
```bash
cd BE
# Kích hoạt môi trường ảo (ví dụ: conda activate fastapi-env hoặc source venv/bin/activate)
pip install -r requirements.txt # Nếu chưa cài dependencies
uvicorn main:app --reload
```
- Backend sẽ chạy tại: `http://localhost:8000`

### Bước 3: Khởi động Frontend (React/Vite)
Mở terminal mới, di chuyển vào thư mục `FE`:
```bash
cd FE
npm install
npm run dev
```
- Frontend sẽ chạy tại: `http://localhost:5173`

### Tài khoản Test (Mật khẩu mặc định: `123456`)
- Admin: `admin@elearning.com`
- Teacher: `teacher@elearning.com`
- Student 1: `student1@elearning.com`
- Student 2: `student2@elearning.com`

## 4. Những việc ĐÃ làm được (What's Done)
- [x] **Infrastructure & Database:** Hoàn thiện Docker compose. Tích hợp thành công cơ chế Polyglot Persistence (Ghi/Đọc đồng bộ giữa SQL và Mongo).
- [x] **Backend Authentication:** Tích hợp JWT, Middleware RBAC (`require_role`), băm mật khẩu bằng thuật toán chuẩn (SHA-256). Đã đồng bộ mã băm vào file `2_seed_data.sql`.
- [x] **Frontend Architecture:** Chuyển đổi thành công 100% codebase từ JavaScript sang TypeScript (`.tsx`). Loại bỏ toàn bộ cảnh báo và lỗi biên dịch của `tsc`.
- [x] **Student Module:** Sinh viên đã có thể tham gia nhóm, nhận thông báo mời, làm bài MCQ (Trắc nghiệm) và Essay (Tự luận), tự động nộp bài về cả hai DB.
- [x] **Teacher Module:** Giảng viên đã có thể tạo nhóm, mời sinh viên, tạo bài thi, và chấm bài. Tích hợp `Recharts` để vẽ biểu đồ phân tích năng lực sinh viên dựa trên dữ liệu thực.
- [x] **Admin Module:** Admin đã có thể thao tác Quản lý User (CRUD), lọc theo Role, tạo tài khoản mới.

## 5. Những việc CHƯA làm được & Cần cải tiến (What's Next / Improvements)
- [ ] **Deployment (Triển khai):** Cấu hình `docker-compose.prod.yml` để build cả BE và FE, tích hợp Nginx làm Reverse Proxy để deploy lên production server (hoặc VPS).
- [ ] **Stress Test (Kiểm thử tải):** Xây dựng script nạp hàng chục ngàn (10,000+) records bài thi. Mục tiêu để biểu diễn khả năng tối ưu query của `Indexed Views` bên SQL và `Aggregation Pipeline` bên Mongo.
- [ ] **Advanced Analytics & Export:** Chức năng xuất báo cáo điểm số ra file PDF cho Admin/Teacher.
- [ ] **AI Integration:** Tích hợp LLM API (như OpenAI) để gợi ý chấm điểm và nhận xét các bài luận (Essay) tự động giúp Giảng viên.
- [ ] **Security Enhancement:** Bổ sung cơ chế Refresh Token cho JWT, thiết lập Rate Limiting bảo vệ API khỏi Brute Force.

## 6. Lưu ý sống còn cho Agent tiếp theo (Crucial Notes for Next Agents)
1. **Routing & Giao diện:** Mọi thay đổi URL hoặc thêm màn hình mới phải dựa trên và cập nhật đồng bộ vào `SCREEN.md`. Tuyệt đối không tự ý đẻ thêm Route ngoài luồng chuẩn.
2. **TypeScript & Build Check:** Cấu hình `tsconfig.app.json` cực kỳ khắt khe (strict). Trước khi hoàn thành một logic trên Frontend, hãy chạy `npm run build` hoặc `npx tsc -b` trong thư mục `FE` để đảm bảo không để lại bất kỳ lỗi biên dịch nào.
3. **Mật khẩu Database:** Khi tạo mới User trực tiếp vào SQL bằng Script, KHÔNG insert mật khẩu dạng plaintext. Luôn băm mật khẩu bằng logic băm SHA-256 được mô tả trong `BE/auth.py`.
4. **Data Sync (Tính nhất quán dữ liệu):** Bất kỳ API nào thay đổi cấu trúc Bài thi hoặc Bài làm, bạn đều phải đảm bảo tính toán đồng thời trên cả Mongo và SQL. Lỗi dữ liệu bất đồng bộ là lỗi nguy hiểm nhất của kiến trúc này.
