/* ==============================================
   TÀI LIỆU: MẪU AGGREGATION PIPELINES (MONGODB)
   Mục đích: Mô phỏng logic mà Backend (Python) sẽ dùng để query lấy dữ liệu vẽ biểu đồ.
   (Không cần run file này, chỉ dùng để tham khảo/copy vào code BE)
============================================== */

db = db.getSiblingDB('ElearningAnalytics');

// Biến giả định (Trong Python BE sẽ truyền tham số thật vào đây)
var EXAM_ID_MCQ = "ID_BAI_THI_TRAC_NGHIEM_TU_SQL"; 
var EXAM_ID_ESSAY = "ID_BAI_THI_TU_LUAN_TU_SQL";

/* ==============================================
   BIỂU ĐỒ 1: QUESTION PERFORMANCE (Dành cho bài thi Trắc nghiệm)
   Mục tiêu: Đếm số lượng sinh viên chọn đúng / sai cho mỗi câu hỏi
   Vị trí hiển thị: SCREEN.md -> .../teacher/exams/mcq/{ExamID}
============================================== */
var pipelineQuestionPerformance = [
    // 1. Lọc toàn bộ bài nộp của một Exam cụ thể
    { $match: { examId: EXAM_ID_MCQ } },
    
    // 2. Trải phẳng (Unwind) mảng answers để mỗi object là 1 document
    { $unwind: "$answers" },
    
    // 3. Gom nhóm theo từng câu hỏi và đếm
    { $group: {
        _id: "$answers.questionId",
        totalAnswers: { $sum: 1 },
        // Sử dụng $cond (Condition) để đếm những câu có isCorrect = true
        correctAnswers: { 
            $sum: { $cond: [ { $eq: ["$answers.isCorrect", true] }, 1, 0 ] } 
        }
    }},
    
    // 4. Định dạng lại cấu trúc trả về và tính %
    { $project: {
        questionId: "$_id",
        _id: 0,
        totalAnswers: 1,
        correctAnswers: 1,
        accuracyPercentage: { 
            // Công thức: (correctAnswers / totalAnswers) * 100
            $multiply: [ { $divide: ["$correctAnswers", "$totalAnswers"] }, 100 ] 
        }
    }},
    
    // 5. Sort lại theo đúng thứ tự câu hỏi để vẽ biểu đồ
    { $sort: { questionId: 1 } }
];

// Lệnh chạy:
// db.Submission_Answers.aggregate(pipelineQuestionPerformance);


/* ==============================================
   BIỂU ĐỒ 2: AVERAGE SCORE PER QUESTION (Dành cho bài thi Tự luận)
   Mục tiêu: Tính điểm trung bình (do Teacher chấm) của từng câu hỏi
   Vị trí hiển thị: SCREEN.md -> .../teacher/exams/essay/{ExamID}
============================================== */
var pipelineAverageScore = [
    { $match: { examId: EXAM_ID_ESSAY } },
    { $unwind: "$answers" },
    { $group: {
        _id: "$answers.questionId",
        // Tính Average dựa trên trường "score" mà giáo viên đã nhập
        averageScore: { $avg: "$answers.score" }
    }},
    { $project: {
        questionId: "$_id",
        _id: 0,
        // Làm tròn điểm đến 2 chữ số thập phân
        averageScore: { $round: ["$averageScore", 2] }
    }},
    { $sort: { questionId: 1 } }
];

// Lệnh chạy:
// db.Submission_Answers.aggregate(pipelineAverageScore);
