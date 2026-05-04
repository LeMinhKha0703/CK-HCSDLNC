-- ==============================================
-- SCRIPT MÔ PHỎNG DỮ LIỆU MẪU (SEED DATA)
-- ==============================================

USE ElearningDB;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- Xóa dữ liệu cũ nếu có (để tránh lỗi khi chạy lại nhiều lần)
DELETE FROM Submissions;
DELETE FROM Exams;
DELETE FROM Group_Students;
DELETE FROM Groups;
DELETE FROM Users;
GO

-- 1. Insert Users (Password hash SHA-256 của "123456")
INSERT INTO Users (UserID, FullName, Email, PasswordHash, Role) VALUES 
('11111111-1111-1111-1111-111111111111', 'System Admin',    'admin@elearning.com',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin'),
('22222222-2222-2222-2222-222222222222', 'John Smith',      'teacher@elearning.com',  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Teacher'),
('33333333-3333-3333-3333-333333333331', 'Alice Johnson',   'student1@elearning.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Student'),
('33333333-3333-3333-3333-333333333332', 'Bob Williams',    'student2@elearning.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Student'),
('33333333-3333-3333-3333-333333333333', 'Charlie Brown',   'student3@elearning.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Student'),
('33333333-3333-3333-3333-333333333334', 'Diana Prince',    'student4@elearning.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Student'),
('33333333-3333-3333-3333-333333333335', 'Ethan Hunt',      'student5@elearning.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Student'),
('33333333-3333-3333-3333-333333333336', 'Fiona Gallagher', 'student6@elearning.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Student');

-- 2. Insert Groups
-- TotalStudent set thủ công để mô phỏng ban đầu, Trigger trg_AfterInsert_UpdateTotalStudent sẽ tự chạy khi insert Group_Students
INSERT INTO Groups (GroupID, TeacherID, GroupName, TotalStudent) VALUES 
('44444444-4444-4444-4444-444444444441', '22222222-2222-2222-2222-222222222222', 'Advanced Database Systems', 0),
('44444444-4444-4444-4444-444444444442', '22222222-2222-2222-2222-222222222222', 'Web Development 101', 0);

-- 3. Insert Group_Students
-- (Alice, Bob, Charlie vào Group 1)
-- (Alice, Diana vào Group 2)
INSERT INTO Group_Students (GroupID, StudentID) VALUES 
('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331'),
('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333332'),
('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333333'),
('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333331'),
('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333334');

-- 4. Insert Exams
INSERT INTO Exams (ExamID, GroupID, Title, Type, TotalQuestions, EndAt) VALUES 
('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', 'Midterm MCQ Quiz',        'MCQ',   2, DATEADD(day, -1, GETDATE())), -- Locked (Quá hạn)
('55555555-5555-5555-5555-555555555552', '44444444-4444-4444-4444-444444444441', 'Database Design Essay',   'Essay', 1, DATEADD(day, 7, GETDATE())),  -- Active
('55555555-5555-5555-5555-555555555553', '44444444-4444-4444-4444-444444444442', 'React Fundamentals',      'MCQ',   2, DATEADD(day, 14, GETDATE())), -- Active
('55555555-5555-5555-5555-555555555554', '44444444-4444-4444-4444-444444444442', 'Frontend Architecture',   'Essay', 2, DATEADD(day, -2, GETDATE())); -- Locked (Quá hạn)

-- 5. Insert Submissions
INSERT INTO Submissions (SubmissionID, ExamID, StudentID, TotalScore, Status) VALUES 
-- Exam 1 (Group 1 - MCQ Locked)
(NEWID(), '55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333331', 8.5, 'Graded'), -- Alice
(NEWID(), '55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333332', 9.0, 'Graded'), -- Bob
-- Exam 2 (Group 1 - Essay Active)
(NEWID(), '55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333331', 0, 'Pending'), -- Alice (Chưa chấm)
(NEWID(), '55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333332', 7.5, 'Graded'), -- Bob (Đã chấm)
-- Exam 3 (Group 2 - MCQ Active)
(NEWID(), '55555555-5555-5555-5555-555555555553', '33333333-3333-3333-3333-333333333331', 10.0, 'Graded'), -- Alice
-- Exam 4 (Group 2 - Essay Locked)
(NEWID(), '55555555-5555-5555-5555-555555555554', '33333333-3333-3333-3333-333333333331', 8.0, 'Graded'), -- Alice
(NEWID(), '55555555-5555-5555-5555-555555555554', '33333333-3333-3333-3333-333333333334', 0, 'Locked'); -- Diana (Missed deadline, Locked in Pending)

GO
