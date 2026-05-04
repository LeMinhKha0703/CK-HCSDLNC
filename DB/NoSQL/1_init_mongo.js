/* ==============================================
   SCRIPT KHỞI TẠO MONGODB & SEED DATA
   Dự án: E-learning Analytics
   Cách chạy: Mở MongoDB Compass -> Kéo thả file hoặc paste vào mongosh
============================================== */

// 1. Chỉ định Database (Sẽ tự động tạo nếu chưa có)
db = db.getSiblingDB('ElearningAnalytics');

// Xóa dữ liệu cũ để tránh trùng lặp khi chạy lại
db.Exam_Questions.drop();
db.Submission_Answers.drop();

// 2. Khởi tạo cấu trúc các Collections
db.createCollection('Exam_Questions');
db.createCollection('Submission_Answers');

// ==============================================
// ADVANCED DB FEATURE: TẠO INDEXES ĐỂ TỐI ƯU HIỆU NĂNG QUERY
// ==============================================

// Bảng Submission_Answers: Dùng để query bài làm của một sinh viên cụ thể trong một bài thi cụ thể
db.Submission_Answers.createIndex({ "examId": 1, "studentId": 1 });

// Index phụ trợ cho các thao tác Aggregation
db.Submission_Answers.createIndex({ "examId": 1 });

// ==============================================
// SEED DATA: MAPPING VỚI SQL SERVER
// ==============================================

// 1. Data Exam_Questions
db.Exam_Questions.insertMany([
  {
    "_id": "55555555-5555-5555-5555-555555555551",
    "questions": [
      { "id": "q1", "text": "What is normalization?", "options": ["A process of organizing data", "A type of database", "A query language", "None of the above"], "correctAnswer": "A process of organizing data" },
      { "id": "q2", "text": "What does ACID stand for?", "options": ["Atomicity, Consistency, Isolation, Durability", "Action, Commit, Isolate, Drop", "Array, Class, Integer, Double", "None"], "correctAnswer": "Atomicity, Consistency, Isolation, Durability" }
    ]
  },
  {
    "_id": "55555555-5555-5555-5555-555555555552",
    "questions": [
      { "id": "q1", "text": "Explain the differences between RDBMS and NoSQL databases. Provide use cases for each." }
    ]
  },
  {
    "_id": "55555555-5555-5555-5555-555555555553",
    "questions": [
      { "id": "q1", "text": "What is JSX?", "options": ["JavaScript XML", "Java Syntax Extension", "JSON X", "None"], "correctAnswer": "JavaScript XML" },
      { "id": "q2", "text": "Which hook is used for side effects in React?", "options": ["useEffect", "useState", "useContext", "useReducer"], "correctAnswer": "useEffect" }
    ]
  },
  {
    "_id": "55555555-5555-5555-5555-555555555554",
    "questions": [
      { "id": "q1", "text": "Describe the Virtual DOM and how React uses it to optimize rendering." },
      { "id": "q2", "text": "What are the core principles of Redux?" }
    ]
  }
]);

// 2. Data Submission_Answers
db.Submission_Answers.insertMany([
  // Exam 1 (MCQ - Group 1)
  {
    "examId": "55555555-5555-5555-5555-555555555551",
    "studentId": "33333333-3333-3333-3333-333333333331", // Alice (8.5)
    "answers": [
      { "questionId": "q1", "studentResponse": "A process of organizing data" },
      { "questionId": "q2", "studentResponse": "Atomicity, Consistency, Isolation, Durability" }
    ]
  },
  {
    "examId": "55555555-5555-5555-5555-555555555551",
    "studentId": "33333333-3333-3333-3333-333333333332", // Bob (9.0)
    "answers": [
      { "questionId": "q1", "studentResponse": "A process of organizing data" },
      { "questionId": "q2", "studentResponse": "Atomicity, Consistency, Isolation, Durability" }
    ]
  },
  // Exam 2 (Essay - Group 1)
  {
    "examId": "55555555-5555-5555-5555-555555555552",
    "studentId": "33333333-3333-3333-3333-333333333331", // Alice (Pending)
    "answers": [
      { "questionId": "q1", "studentResponse": "RDBMS guarantees ACID properties and uses SQL, while NoSQL offers flexible schemas and high horizontal scalability. Use RDBMS for banking, and NoSQL for social media feeds." }
    ]
  },
  {
    "examId": "55555555-5555-5555-5555-555555555552",
    "studentId": "33333333-3333-3333-3333-333333333332", // Bob (Graded)
    "answers": [
      { "questionId": "q1", "studentResponse": "RDBMS is relational. NoSQL is non-relational." },
      { "questionId": "q1_score", "score": 7.5 } // Teacher đã chấm
    ]
  },
  // Exam 3 (MCQ - Group 2)
  {
    "examId": "55555555-5555-5555-5555-555555555553",
    "studentId": "33333333-3333-3333-3333-333333333331", // Alice (10.0)
    "answers": [
      { "questionId": "q1", "studentResponse": "JavaScript XML" },
      { "questionId": "q2", "studentResponse": "useEffect" }
    ]
  },
  // Exam 4 (Essay - Group 2)
  {
    "examId": "55555555-5555-5555-5555-555555555554",
    "studentId": "33333333-3333-3333-3333-333333333331", // Alice (Graded)
    "answers": [
      { "questionId": "q1", "studentResponse": "Virtual DOM is a lightweight copy of the real DOM. React updates it first, diffs it, and only updates changed nodes in the real DOM." },
      { "questionId": "q1_score", "score": 4.5 },
      { "questionId": "q2", "studentResponse": "Single source of truth, state is read-only, changes are made with pure functions." },
      { "questionId": "q2_score", "score": 3.5 }
    ]
  }
]);

print("✅ Khởi tạo MongoDB và Seed Data hoàn tất!");
