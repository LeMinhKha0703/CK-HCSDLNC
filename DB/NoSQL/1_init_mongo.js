/* ==============================================
   SCRIPT KHỞI TẠO MONGODB
   Dự án: E-learning Analytics
   Cách chạy: Mở MongoDB Compass -> Kéo thả file hoặc paste vào mongosh
============================================== */

// 1. Chỉ định Database (Sẽ tự động tạo nếu chưa có)
db = db.getSiblingDB('ElearningAnalytics');

// 2. Khởi tạo cấu trúc các Collections
// (Dù MongoDB là schema-less, việc khởi tạo tường minh giúp dễ dàng quản lý)
db.createCollection('Exam_Questions');
db.createCollection('Submission_Answers');

// ==============================================
// ADVANCED DB FEATURE: TẠO INDEXES ĐỂ TỐI ƯU HIỆU NĂNG QUERY
// ==============================================

// Bảng Exam_Questions: Lấy đề thi dựa trên ID
// Mặc định _id đã có index, nhưng ghi ra đây để biểu diễn tính mapping với SQL
// db.Exam_Questions.createIndex({ "_id": 1 }); 

// Bảng Submission_Answers: Dùng để query bài làm của một sinh viên cụ thể trong một bài thi cụ thể
// Bắt buộc phải có Compound Index này để truy xuất nhanh khi Teacher chấm bài.
db.Submission_Answers.createIndex({ "examId": 1, "studentId": 1 });

// Index phụ trợ cho các thao tác Aggregation
db.Submission_Answers.createIndex({ "examId": 1 });

print("✅ Khởi tạo MongoDB hoàn tất. Các collection và indexes đã được tạo.");
