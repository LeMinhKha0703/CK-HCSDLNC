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

-- 1. Insert Users (Password đang giả định là hashed)
INSERT INTO Users (UserID, FullName, Email, PasswordHash, Role) VALUES 
(@AdminID, 'System Admin', 'admin@elearning.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin'),
(@TeacherID, 'Nguyen Van Teacher', 'teacher@elearning.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Teacher'),
(@Student1ID, 'Tran Thi Student', 'student1@elearning.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Student'),
(@Student2ID, 'Le Van Student', 'student2@elearning.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Student');

-- 2. Insert Group
INSERT INTO Groups (GroupID, TeacherID, GroupName, TotalStudent) VALUES 
(@GroupID, @TeacherID, 'Lớp Advanced Database Systems - HK2 25-26', 2);

-- 3. Insert Group_Students
INSERT INTO Group_Students (GroupID, StudentID) VALUES 
(@GroupID, @Student1ID),
(@GroupID, @Student2ID);

-- 4. Insert Exams
INSERT INTO Exams (ExamID, GroupID, Title, Type, TotalQuestions, EndAt) VALUES 
(@ExamMCQID, @GroupID, 'Bài kiểm tra trắc nghiệm số 1', 'MCQ', 10, DATEADD(day, 7, GETDATE())),
(@ExamEssayID, @GroupID, 'Bài tiểu luận cuối kỳ', 'Essay', 2, DATEADD(day, 14, GETDATE()));

-- 5. Insert Submissions (Sinh viên 1 đã có điểm, Sinh viên 2 đang Pending)
INSERT INTO Submissions (ExamID, StudentID, TotalScore, Status) VALUES 
(@ExamMCQID, @Student1ID, 8.5, 'Graded'),
(@ExamEssayID, @Student1ID, 9.0, 'Graded'),
(@ExamMCQID, @Student2ID, 0, 'Pending');

-- XUẤT RA CONSOLE ĐỂ COPY IDs test MongoDB
SELECT 'COPY CÁC ID DƯỚI ĐÂY ĐỂ TEST TRONG MONGODB NẾU CẦN' AS Instructions;
SELECT 'Exam MCQ ID' as DataType, @ExamMCQID as GeneratedID
UNION ALL
SELECT 'Exam Essay ID', @ExamEssayID
UNION ALL
SELECT 'Student1 ID', @Student1ID;
GO
