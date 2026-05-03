-- ==============================================
-- SCRIPT MÔ PHỎNG DỮ LIỆU MẪU (SEED DATA)
-- ==============================================

USE ElearningDB;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- Khai báo biến ID để đồng bộ hóa các bảng
DECLARE @AdminID UNIQUEIDENTIFIER = NEWID();
DECLARE @TeacherID UNIQUEIDENTIFIER = NEWID();
DECLARE @Student1ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Student2ID UNIQUEIDENTIFIER = NEWID();
DECLARE @GroupID UNIQUEIDENTIFIER = NEWID();
DECLARE @ExamMCQID UNIQUEIDENTIFIER = NEWID();
DECLARE @ExamEssayID UNIQUEIDENTIFIER = NEWID();

-- 1. Insert Users (Password hash SHA-256 của "123456")
INSERT INTO Users (UserID, FullName, Email, PasswordHash, Role) VALUES 
(@AdminID,    'System Admin',    'admin@elearning.com',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin'),
(@TeacherID,  'John Smith',      'teacher@elearning.com',  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Teacher'),
(@Student1ID, 'Alice Johnson',   'student1@elearning.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Student'),
(@Student2ID, 'Bob Williams',    'student2@elearning.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Student');

-- 2. Insert Group
-- Trigger sẽ KHÔNG chạy ở đây vì insert trực tiếp vào Groups (không qua Group_Students)
-- TotalStudent được set thủ công = 2 để khớp với dữ liệu seed bên dưới
INSERT INTO Groups (GroupID, TeacherID, GroupName, TotalStudent) VALUES 
(@GroupID, @TeacherID, 'Advanced Database Systems - Semester 2 25-26', 2);

-- 3. Insert Group_Students
-- [Trigger trg_AfterInsert_UpdateTotalStudent sẽ tự chạy và cập nhật lại TotalStudent]
INSERT INTO Group_Students (GroupID, StudentID) VALUES 
(@GroupID, @Student1ID),
(@GroupID, @Student2ID);

-- 4. Insert Exams
INSERT INTO Exams (ExamID, GroupID, Title, Type, TotalQuestions, EndAt) VALUES 
(@ExamMCQID,   @GroupID, 'Multiple Choice Quiz #1', 'MCQ',   10, DATEADD(day, 7, GETDATE())),
(@ExamEssayID, @GroupID, 'Final Essay Assignment',  'Essay',  2, DATEADD(day, 14, GETDATE()));

-- 5. Insert Submissions (Alice đã có điểm, Bob đang Pending)
INSERT INTO Submissions (ExamID, StudentID, TotalScore, Status) VALUES 
(@ExamMCQID,   @Student1ID, 8.5, 'Graded'),
(@ExamEssayID, @Student1ID, 9.0, 'Graded'),
(@ExamMCQID,   @Student2ID, 0,   'Pending');

-- In ra console các ID để dùng test trong MongoDB nếu cần
SELECT 'COPY THESE IDs FOR MONGODB TESTING IF NEEDED' AS Instructions;
SELECT 'Exam MCQ ID'   AS DataType, @ExamMCQID   AS GeneratedID
UNION ALL
SELECT 'Exam Essay ID',               @ExamEssayID
UNION ALL
SELECT 'Student1 (Alice) ID',         @Student1ID;
GO
