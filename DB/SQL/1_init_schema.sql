-- ==============================================
-- SCRIPT KHỞI TẠO SCHEMA CHO SQL SERVER
-- Dự án: E-learning Analytics
-- ==============================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ElearningDB')
BEGIN
    CREATE DATABASE ElearningDB;
END
GO

USE ElearningDB;
GO

-- Xóa các bảng/view cũ nếu tồn tại để dễ dàng chạy lại script nhiều lần
IF OBJECT_ID('dbo.vw_StudentGroupScore', 'V') IS NOT NULL DROP VIEW dbo.vw_StudentGroupScore;
IF OBJECT_ID('dbo.Submissions', 'U') IS NOT NULL DROP TABLE dbo.Submissions;
IF OBJECT_ID('dbo.Exams', 'U') IS NOT NULL DROP TABLE dbo.Exams;
IF OBJECT_ID('dbo.Notifications', 'U') IS NOT NULL DROP TABLE dbo.Notifications;
IF OBJECT_ID('dbo.Group_Students', 'U') IS NOT NULL DROP TABLE dbo.Group_Students;
IF OBJECT_ID('dbo.Groups', 'U') IS NOT NULL DROP TABLE dbo.Groups;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- 1. Bảng Users
CREATE TABLE Users (
    UserID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FullName NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    Role NVARCHAR(50) NOT NULL CHECK (Role IN ('Student', 'Teacher', 'Admin')),
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Tạo index cho Email để tìm kiếm nhanh khi Login
CREATE NONCLUSTERED INDEX IX_Users_Email ON Users(Email);
GO

-- 2. Bảng Groups
CREATE TABLE Groups (
    GroupID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TeacherID UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    GroupName NVARCHAR(255) NOT NULL,
    TotalStudent INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- 3. Bảng Group_Students
CREATE TABLE Group_Students (
    GroupID UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Groups(GroupID),
    StudentID UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserID),
    JoinedDate DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (GroupID, StudentID)
);
GO

-- 4. Bảng Notifications
CREATE TABLE Notifications (
    NotifID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Title NVARCHAR(255) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Type NVARCHAR(50) NOT NULL CHECK (Type IN ('Invite_Group', 'Normal')),
    TargetID UNIQUEIDENTIFIER NULL, -- Vd: GroupID dùng để điều hướng khi click Accept
    IsRead BIT DEFAULT 0,
    SendDate DATETIME DEFAULT GETDATE()
);
GO

-- 5. Bảng Exams (Chỉ lưu siêu dữ liệu - Metadata)
CREATE TABLE Exams (
    ExamID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    GroupID UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Groups(GroupID),
    Title NVARCHAR(255) NOT NULL,
    Type NVARCHAR(50) NOT NULL CHECK (Type IN ('Essay', 'MCQ')),
    TotalQuestions INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    EndAt DATETIME NOT NULL
);
GO

-- 6. Bảng Submissions (Chỉ lưu điểm tổng và trạng thái)
CREATE TABLE Submissions (
    SubmissionID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ExamID UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Exams(ExamID),
    StudentID UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    TotalScore DECIMAL(5,2) NOT NULL DEFAULT 0,
    Status NVARCHAR(50) NOT NULL CHECK (Status IN ('Pending', 'Graded', 'Locked')),
    SubmitedAt DATETIME DEFAULT GETDATE()
);
GO

-- ==============================================
-- ADVANCED DB FEATURE: INDEXED VIEWS
-- Mục đích: Tính toán sẵn điểm tổng của sinh viên trong nhóm để phục vụ tính Average Grade và Rank
-- Tránh việc phải JOIN và SUM trên toàn bộ bảng Submissions mỗi lần tải trang Dashboard.
-- ==============================================
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE VIEW dbo.vw_StudentGroupScore
WITH SCHEMABINDING
AS
SELECT 
    e.GroupID,
    s.StudentID,
    SUM(s.TotalScore) AS TotalScoreSum,
    COUNT_BIG(*) AS GradedExamsCount
FROM dbo.Submissions s
JOIN dbo.Exams e ON s.ExamID = e.ExamID
WHERE s.Status = 'Graded'
GROUP BY e.GroupID, s.StudentID;
GO

-- Tạo Unique Clustered Index để vật lý hóa View này lên ổ cứng (Lưu trữ kết quả trực tiếp)
CREATE UNIQUE CLUSTERED INDEX CIX_vw_StudentGroupScore 
ON dbo.vw_StudentGroupScore (GroupID, StudentID);
GO
