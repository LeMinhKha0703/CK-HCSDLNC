-- ==============================================
-- ADVANCED DB: WINDOW FUNCTIONS & CTEs
-- Dự án: E-learning Analytics
-- Mục đích: Tính chính xác Average Grade và Rank Position
--           của từng sinh viên trong từng nhóm.
-- Kỹ thuật: CTE (Common Table Expressions) + RANK() OVER()
-- ==============================================

USE ElearningDB;
GO

-- Xóa view cũ nếu tồn tại để chạy lại script
IF OBJECT_ID('dbo.vw_StudentRankInGroup', 'V') IS NOT NULL
    DROP VIEW dbo.vw_StudentRankInGroup;
GO

-- ==============================================
-- VIEW: vw_StudentRankInGroup
-- Mô tả: Sử dụng CTE để trước tiên tính điểm
--        trung bình (Average Grade) của từng sinh viên
--        trong mỗi nhóm, sau đó áp dụng Window Function
--        RANK() OVER(PARTITION BY...) để xếp hạng
--        mà không làm gộp dòng như GROUP BY.
-- Cách dùng: SELECT * FROM vw_StudentRankInGroup
--            WHERE GroupID = '<your-group-id>'
-- ==============================================
CREATE VIEW dbo.vw_StudentRankInGroup
AS
WITH CTE_StudentAverageScore AS (
    -- Bước 1: Dùng CTE tính điểm trung bình của từng sinh viên trong mỗi nhóm
    -- Chỉ tính các bài đã được chấm (Status = 'Graded')
    SELECT
        e.GroupID,
        s.StudentID,
        u.FullName,
        u.Email,
        AVG(s.TotalScore)   AS AverageGrade,
        COUNT(s.SubmissionID) AS GradedExamCount
    FROM dbo.Submissions s
    JOIN dbo.Exams e      ON s.ExamID   = e.ExamID
    JOIN dbo.Users u      ON s.StudentID = u.UserID
    WHERE s.Status = 'Graded'
    GROUP BY e.GroupID, s.StudentID, u.FullName, u.Email
)
-- Bước 2: Áp dụng Window Function RANK() trên kết quả của CTE
-- PARTITION BY GroupID  → xếp hạng độc lập trong từng nhóm
-- ORDER BY AverageGrade → sinh viên điểm cao nhất = hạng 1
SELECT
    GroupID,
    StudentID,
    FullName,
    Email,
    CAST(AverageGrade AS DECIMAL(5,2))  AS AverageGrade,
    GradedExamCount,
    RANK()       OVER (PARTITION BY GroupID ORDER BY AverageGrade DESC) AS RankPosition,
    DENSE_RANK() OVER (PARTITION BY GroupID ORDER BY AverageGrade DESC) AS DenseRankPosition,
    ROW_NUMBER() OVER (PARTITION BY GroupID ORDER BY AverageGrade DESC, StudentID) AS RowNum
FROM CTE_StudentAverageScore;
GO

-- ==============================================
-- KIỂM TRA: Chạy câu query sau sau khi seeded data
-- để xem kết quả xếp hạng
-- ==============================================
-- SELECT * FROM dbo.vw_StudentRankInGroup ORDER BY GroupID, RankPosition;
