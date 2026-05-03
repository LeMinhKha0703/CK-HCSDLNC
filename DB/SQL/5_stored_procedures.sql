-- ==============================================
-- ADVANCED DB: STORED PROCEDURES (SP) + TRANSACTIONS + TRY...CATCH
-- Dự án: E-learning Analytics
-- Mục đích: Đóng gói các nghiệp vụ phức tạp có tính nguyên tử
--           (Atomicity) - ACID.
-- Kỹ thuật: CREATE PROCEDURE, BEGIN TRAN, COMMIT, ROLLBACK,
--           TRY...CATCH, RAISERROR, XACT_STATE()
-- ==============================================

USE ElearningDB;
GO

-- ==============================================
-- SP: sp_AcceptGroupInvitation
-- Nghiệp vụ: Sinh viên chấp nhận lời mời vào nhóm.
-- Luồng ACID:
--   1. Kiểm tra lời mời có hợp lệ (Invite_Group, chưa đọc).
--   2. Kiểm tra sinh viên CHƯA có trong nhóm (tránh trùng lặp).
--   3. INSERT vào Group_Students.
--      [Trigger sẽ tự cập nhật TotalStudent lên bảng Groups]
--   4. Đánh dấu thông báo là đã đọc (IsRead = 1).
-- Lỗi:   Nếu bất kỳ bước nào thất bại → ROLLBACK toàn bộ.
--        RAISERROR trả về thông điệp lỗi rõ ràng cho Backend.
-- Params: @NotifID, @StudentID
-- ==============================================
IF OBJECT_ID('dbo.sp_AcceptGroupInvitation', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_AcceptGroupInvitation;
GO

CREATE PROCEDURE dbo.sp_AcceptGroupInvitation
    @NotifID   UNIQUEIDENTIFIER,
    @StudentID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @GroupID UNIQUEIDENTIFIER;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Bước 1: Xác minh thông báo tồn tại, thuộc đúng sinh viên và là loại Invite_Group
        SELECT @GroupID = TargetID
        FROM dbo.Notifications
        WHERE NotifID = @NotifID
          AND UserID  = @StudentID
          AND Type    = 'Invite_Group';

        IF @GroupID IS NULL
        BEGIN
            RAISERROR('ERR_INVITATION_NOT_FOUND: Lời mời không tồn tại hoặc không thuộc về sinh viên này.', 16, 1);
            RETURN;
        END;

        -- Bước 2: Kiểm tra sinh viên đã có trong nhóm chưa (tránh Duplicate Key)
        IF EXISTS (
            SELECT 1 FROM dbo.Group_Students
            WHERE GroupID = @GroupID AND StudentID = @StudentID
        )
        BEGIN
            RAISERROR('ERR_ALREADY_MEMBER: Sinh viên đã là thành viên của nhóm này.', 16, 1);
            RETURN;
        END;

        -- Bước 3: INSERT sinh viên vào nhóm
        -- [Trigger trg_AfterInsert_UpdateTotalStudent sẽ tự chạy ở đây]
        INSERT INTO dbo.Group_Students (GroupID, StudentID)
        VALUES (@GroupID, @StudentID);

        -- Bước 4: Đánh dấu thông báo đã đọc
        UPDATE dbo.Notifications
        SET IsRead = 1
        WHERE NotifID = @NotifID;

        COMMIT TRANSACTION;

        -- Trả về GroupID để Backend có thể điều hướng FE vào đúng nhóm
        SELECT @GroupID AS JoinedGroupID, 'SUCCESS' AS Status;

    END TRY
    BEGIN CATCH
        -- Nếu transaction đang mở, rollback toàn bộ
        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;

        -- Ném lại lỗi để Backend (FastAPI) bắt được và trả về HTTP 400
        THROW;
    END CATCH;
END;
GO


-- ==============================================
-- SP: sp_LockExpiredSubmissions
-- Nghiệp vụ: Khóa tất cả bài nộp 'Pending' của các bài thi
--           đã quá hạn (EndAt < thời điểm hiện tại).
-- Mục đích môn học: Minh họa Stored Procedure thực hiện
--           thao tác DML hàng loạt có Transaction.
-- Cách gọi từ Backend: EXEC sp_LockExpiredSubmissions
-- ==============================================
IF OBJECT_ID('dbo.sp_LockExpiredSubmissions', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_LockExpiredSubmissions;
GO

CREATE PROCEDURE dbo.sp_LockExpiredSubmissions
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AffectedRows INT = 0;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Cập nhật tất cả submission đang Pending thuộc về bài thi đã quá hạn
        UPDATE s
        SET s.Status = 'Locked'
        FROM dbo.Submissions s
        JOIN dbo.Exams e ON s.ExamID = e.ExamID
        WHERE s.Status = 'Pending'
          AND e.EndAt  < GETDATE();

        SET @AffectedRows = @@ROWCOUNT;

        COMMIT TRANSACTION;

        -- Trả về số dòng bị ảnh hưởng để log ở Backend
        SELECT @AffectedRows AS LockedSubmissions, 'SUCCESS' AS Status;

    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO


-- ==============================================
-- KIỂM TRA bằng Postman / SSMS:
-- Gọi SP chấp nhận lời mời (cần NotifID và StudentID thực từ seed data):
-- EXEC sp_AcceptGroupInvitation @NotifID='<notif-guid>', @StudentID='<student-guid>';
--
-- Gọi SP khóa bài thi hết hạn:
-- EXEC sp_LockExpiredSubmissions;
-- ==============================================
