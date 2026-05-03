-- ==============================================
-- ADVANCED DB: USER-DEFINED FUNCTIONS (UDF)
-- Dự án: E-learning Analytics
-- Mục đích: Đóng gói các hàm tính toán dùng chung,
--           có thể tái sử dụng trong bất kỳ câu query,
--           View, Stored Procedure nào.
-- Kỹ thuật: Scalar Function, Inline Table-Valued Function
-- ==============================================

USE ElearningDB;
GO

-- ==============================================
-- UDF (Scalar): fn_CalculateAverageGrade
-- Input:  @StudentID, @GroupID
-- Output: Điểm trung bình (DECIMAL) của sinh viên
--         trong nhóm đó, chỉ tính bài đã được chấm (Graded).
--         Trả về NULL nếu chưa có bài nào được chấm.
-- Ví dụ: SELECT dbo.fn_CalculateAverageGrade('<StudentID>', '<GroupID>')
-- ==============================================
IF OBJECT_ID('dbo.fn_CalculateAverageGrade', 'FN') IS NOT NULL
    DROP FUNCTION dbo.fn_CalculateAverageGrade;
GO

CREATE FUNCTION dbo.fn_CalculateAverageGrade
(
    @StudentID UNIQUEIDENTIFIER,
    @GroupID   UNIQUEIDENTIFIER
)
RETURNS DECIMAL(5, 2)
AS
BEGIN
    DECLARE @AvgGrade DECIMAL(5, 2);

    SELECT @AvgGrade = AVG(s.TotalScore)
    FROM dbo.Submissions s
    JOIN dbo.Exams e ON s.ExamID = e.ExamID
    WHERE s.StudentID = @StudentID
      AND e.GroupID   = @GroupID
      AND s.Status    = 'Graded';

    -- Trả về NULL nếu chưa có bài nào được chấm
    RETURN @AvgGrade;
END;
GO


-- ==============================================
-- UDF (Inline Table-Valued): fn_GetGroupLeaderboard
-- Input:  @GroupID
-- Output: Bảng xếp hạng toàn nhóm với đầy đủ thông tin
--         (FullName, Email, AverageGrade, RankPosition)
--         Tái sử dụng hàm fn_CalculateAverageGrade ở trên
--         và áp dụng thêm RANK() OVER().
-- Ví dụ: SELECT * FROM dbo.fn_GetGroupLeaderboard('<GroupID>')
--        ORDER BY RankPosition;
-- Lợi thế so với View: Có thể truyền tham số lọc theo GroupID.
-- ==============================================
IF OBJECT_ID('dbo.fn_GetGroupLeaderboard', 'IF') IS NOT NULL
    DROP FUNCTION dbo.fn_GetGroupLeaderboard;
GO

CREATE FUNCTION dbo.fn_GetGroupLeaderboard
(
    @GroupID UNIQUEIDENTIFIER
)
RETURNS TABLE
AS
RETURN
(
    WITH CTE_Scores AS (
        SELECT
            u.UserID,
            u.FullName,
            u.Email,
            -- Tái sử dụng Scalar UDF trong Table-Valued Function
            dbo.fn_CalculateAverageGrade(u.UserID, @GroupID) AS AverageGrade
        FROM dbo.Group_Students gs
        JOIN dbo.Users u ON gs.StudentID = u.UserID
        WHERE gs.GroupID = @GroupID
    )
    SELECT
        UserID       AS StudentID,
        FullName,
        Email,
        ISNULL(AverageGrade, 0.0)                                        AS AverageGrade,
        RANK()       OVER (ORDER BY ISNULL(AverageGrade, 0.0) DESC)       AS RankPosition,
        DENSE_RANK() OVER (ORDER BY ISNULL(AverageGrade, 0.0) DESC)       AS DenseRank
    FROM CTE_Scores
);
GO


-- ==============================================
-- KIỂM TRA:
-- 1. Scalar Function (trả về 1 giá trị điểm):
--    SELECT dbo.fn_CalculateAverageGrade('<StudentID>', '<GroupID>') AS MyGrade;
--
-- 2. Table-Valued Function (trả về bảng xếp hạng toàn nhóm):
--    SELECT * FROM dbo.fn_GetGroupLeaderboard('<GroupID>')
--    ORDER BY RankPosition;
--
-- 3. Tích hợp trong một query lớn hơn:
--    SELECT g.GroupName, lb.*
--    FROM dbo.fn_GetGroupLeaderboard('<GroupID>') lb
--    CROSS JOIN dbo.Groups g WHERE g.GroupID = '<GroupID>';
-- ==============================================
