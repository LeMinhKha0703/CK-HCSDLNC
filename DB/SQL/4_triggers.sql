-- ==============================================
-- ADVANCED DB: DML TRIGGERS
-- Dự án: E-learning Analytics
-- Mục đích: Tự động duy trì tính toàn vẹn dữ liệu
--           mà không cần xử lý trong tầng Backend (Python).
-- Kỹ thuật: AFTER INSERT / AFTER DELETE Trigger
--           trên bảng Group_Students → cập nhật TotalStudent
--           trên bảng Groups.
-- ==============================================

USE ElearningDB;
GO

-- ==============================================
-- TRIGGER: trg_AfterInsert_UpdateTotalStudent
-- Kích hoạt: SAU KHI có sinh viên MỚI tham gia nhóm
--            (INSERT vào Group_Students)
-- Hành động: Đếm lại tổng số sinh viên trong nhóm
--            và cập nhật lên cột TotalStudent của bảng Groups.
-- Ghi chú: Dùng bảng ảo INSERTED (chứa các dòng vừa được thêm)
--          để lấy GroupID cần cập nhật.
-- ==============================================
IF OBJECT_ID('dbo.trg_AfterInsert_UpdateTotalStudent', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_AfterInsert_UpdateTotalStudent;
GO

CREATE TRIGGER dbo.trg_AfterInsert_UpdateTotalStudent
ON dbo.Group_Students
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Cập nhật TotalStudent cho TẤT CẢ các nhóm bị ảnh hưởng
    -- trong một lần insert (INSERT có thể thêm nhiều dòng cùng lúc)
    UPDATE g
    SET g.TotalStudent = (
        SELECT COUNT(*)
        FROM dbo.Group_Students gs
        WHERE gs.GroupID = g.GroupID
    )
    FROM dbo.Groups g
    -- Chỉ cập nhật các nhóm có trong danh sách vừa INSERT
    WHERE g.GroupID IN (SELECT DISTINCT GroupID FROM INSERTED);
END;
GO


-- ==============================================
-- TRIGGER: trg_AfterDelete_UpdateTotalStudent
-- Kích hoạt: SAU KHI sinh viên bị XÓA khỏi nhóm
--            (DELETE từ Group_Students)
-- Hành động: Tương tự trigger INSERT nhưng đếm lại
--            sau khi xóa. Dùng bảng ảo DELETED.
-- ==============================================
IF OBJECT_ID('dbo.trg_AfterDelete_UpdateTotalStudent', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_AfterDelete_UpdateTotalStudent;
GO

CREATE TRIGGER dbo.trg_AfterDelete_UpdateTotalStudent
ON dbo.Group_Students
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE g
    SET g.TotalStudent = (
        SELECT COUNT(*)
        FROM dbo.Group_Students gs
        WHERE gs.GroupID = g.GroupID
    )
    FROM dbo.Groups g
    WHERE g.GroupID IN (SELECT DISTINCT GroupID FROM DELETED);
END;
GO


-- ==============================================
-- KIỂM TRA: Sau khi seed data và chạy script này,
-- thử INSERT và DELETE một dòng trong Group_Students
-- rồi SELECT bảng Groups để thấy TotalStudent tự thay đổi.
-- ==============================================
-- DECLARE @testGroupId UNIQUEIDENTIFIER = '<your-group-id>';
-- DECLARE @testStudentId UNIQUEIDENTIFIER = NEWID();
-- INSERT INTO Users (UserID, FullName, Email, PasswordHash, Role)
--     VALUES (@testStudentId, 'Test Student', 'test@elearning.com', 'hashed', 'Student');
-- INSERT INTO Group_Students (GroupID, StudentID) VALUES (@testGroupId, @testStudentId);
-- SELECT GroupID, GroupName, TotalStudent FROM Groups WHERE GroupID = @testGroupId;
-- -- Kết quả: TotalStudent sẽ tăng lên 1 tự động
-- DELETE FROM Group_Students WHERE GroupID = @testGroupId AND StudentID = @testStudentId;
-- SELECT GroupID, GroupName, TotalStudent FROM Groups WHERE GroupID = @testGroupId;
-- -- Kết quả: TotalStudent sẽ giảm xuống 1 tự động
