# Thông tin màn hình 
* .../login
    * Email, Password 
    * Nút Login
* .../register
    * Fullname, Email, Password, Confirm Password
    * ô tích I am a Teacher
    * Nút Register
* .../logout
    * sẽ logout khỏi hệ thống và chuyển sang giao diện login
## I. Student
* Sidebar có: Logo Student, bên dưới là tên của student, My Groups, Notifications, Log out
* .../student/mygroups (giao diện măc định khi đăng nhập vào)
    * Tiêu đề My Groups
    * Có các thẻ groups: GroupName, FullName(Teacher), CreatedAt
    * khi nhấn vào thẻ group sẽ chuyển sang .../student/group/{GroupName}
        * Tên Group, bên dưới là FullName(Teacher)
        * Thẻ AVERAGE GRADE (điểm trung bình của tất cả bài kiểm tra), RANK POSITION (thứ hạng của student đó trong group)
        * Danh sách các bài kiểm tra: Title, Type (Essay, MCQ), EndAt
            * có 3 trạng thái: chưa làm bài-> có nút Do, đã làm bài -> FINAL SCORE(nếu là Essay mà teacher chưa chấm-> _/10, nếu đã chấm (hoặc trắc nghiệm đã làm)-> điểm/10), quá hạn EndAt-> Locked
    * khi nhấn vào Do
        * nếu Type=Essay sẽ chuyển sang .../exams/essay/{ExamID}
            * thanh sidebar chuyển thành QUESTION NAVIGATOR(TotalQuestions)
            * Title, Time, Content, trường nhập đáp án, ...
        * nếu Type=MCQ sẽ chuyển sang .../exams/mcq/{ExamID}
            * thanh sidebar chuyển thành QUESTION NAVIGATOR(TotalQuestions)
            * Title, Time, Content, các ô radio button, ...
* .../student/notifications
    * danh sách các thông báo: Title, Content. có 2 loại thông báo: thông báo lời mời vào nhóm, thông báo thường. có * nút 'Accept Invitation' nếu là thông báo lời mời vào nhóm, nhấn Accept sẽ chuyển sang giao diện của group
## II. Teacher
* Sidebar có: Logo Teacher, bên dưới là tên của teacher, Group Management, Exam Management, Log out
* .../teacher/groupmanagement (giao diện mặc định khi đăng nhập vào)
    * Tiêu đề Group Management
    * Nút Create New Group, khi nhấn vào sẽ hiện form Create New Group .../teacher/creategroup (có thể code nằm trong code groupmanagement hoặc riêng ra 1 trang)
        * GroupName, trường Upload Student List(.xlsx), trường Add Student by Email(nút add), nút Cancel và Create Group
    * Danh sách các groups: GroupName, TotalStudent, CreatedAt
        * khi nhấn vào thẻ group sẽ chuyển sang .../teacher/group/{GroupName}
            * GroupName, các thẻ TOTAL STUDENTS (TotalStudents), GRADE < 5.0(lọc sinh viên có điểm tổng dưới 5.0), GRADE > 8.0(lọc sinh viên có điểm tổng trên 8.0)
            * Student Directory: STT (tự sort), FullName(Student), Email, Average Grade
            * nút Invite, khi nhấn nút Invite sẽ hiện form Invite Student to {tên group} .../teacher/invite (có thể code nằm trong code groupmanagement hoặc riêng ra 1 trang)
                *  có trường Upload Student List(.xlsx), trường Add Student by Email(nút add), nút Cancel và Invite Students
            * nút Export (Excel), khi nhấn sẽ xuất file excel chứa TOTAL STUDENTS, GRADE < 5.0, GRADE > 8.0 và Student Directory
* .../teacher/exammanagement
    * Tiêu đề Exam Management
    * các thẻ Total Assignments(tổng assignments), Multiple Choice Assignments(tổng mcq), Essay Assignments(tổng essay)
    * Nút Create, khi nhấn vào sẽ chuyển sang .../teacher/createexam
        * Tiêu đề Create Examination
        * Title, Type (Essay, MCQ), GroupName (lọc danh sách group mà teacher này quản lí), TotalQuestions, trường ghi câu hỏi(Essay: chỉ có Content, MCQ: có nội dung và 4 ô nhập đáp án A,B,C,D, nút chọn đáp án đúng) hoặc Add New Question bằng file Excel(.xlsx, định dạng STT, Content, đáp án (nếu là MCQ thì có cột 4 đáp án A,B,C,D và cột đáp án đúng, nếu là Essay thì không có cột đáp án))
        * Danh sách các bài kiểm tra: STT(tự sort), Title(bên dưới là GroupName), Type, CreatedAt, EndAt
            * khi nhấn vào thẻ bài kiểm tra (Type: Essay) sẽ chuyển sang .../teacher/exams/essay/{ExamID}
                * Title, Type, CreatedAt, EndAt, nút Export (Excel), khi nhấn sẽ xuất file excel chứa Student Submissions: STT, FullName(Student), Status(Pending, Graded, Locked), TotalScore
                * bảng biểu đồ cột Average Score per Question (cột dọc là điểm trung bình của 1 câu hỏi được tính bằng cách lấy 10 chia cho TotalQuestions, cột ngang là số thứ tự câu hỏi): thể hiện số điểm trung bình mà teacher chấm của từng câu hỏi
                * Student Submissions: STT, FullName(Student), Status(Pending, Graded, Locked), TotalScore (nếu là Pending hoặc Locked thì TotalScore hiển thị _/10, nếu là Graded thì hiển thị điểm/10), Actions (nếu Status là Pending thì có nút Grade, nếu là Graded thì có nút Review, nếu Status là Locked thì Actions hiện __)
                * Review: khi nhấn vào nút Review sẽ chuyển sang .../teacher/exams/essay/{ExamID}/review/{SubmissionID}
                    * FullName(Student)(bên dưới là Title Exam, SubmitedAt), Content(nội dung câu hỏi số ..), Student Response, Question Navigator, Final Score (hiện điểm cuối cùng (điểm/10)),...
                * Grade: khi nhấn vào nút Grade sẽ chuyển sang .../teacher/exams/essay/{ExamID}/grade/{SubmissionID}
                    * FullName(Student), SubmitedAt, Content(nội dung câu hỏi số ..), Student Response, Question Navigator, Final Score(có trường nhập điểm và nút Save Evaluation),...
                    

            * khi nhấn vào thẻ bài kiểm tra (Type: MCQ) sẽ chuyển sang .../teacher/exams/mcq/{ExamID}
                * Title, Type, CreatedAt, EndAt, nút Export (Excel), khi nhấn sẽ xuất file excel chứa Student Submissions: STT, FullName(Student), Status(Pending, Graded, Locked), TotalScore
                * bảng biểu đồ cột Question Performance (cột dọc là tổng số Student chọn đúng, cột ngang là số thứ tự câu hỏi): thể hiện số lượng sinh viên chọn đúng cho từng câu hỏi
                * Student Submissions: STT, FullName(Student), Status(Pending, Graded, Locked), TotalScore (nếu là Pending hoặc Locked thì TotalScore hiển thị _/10, nếu là Graded thì hiển thị điểm/10), Actions (nếu Status là Pending hoặc Locked thì Actions hiện __, nếu Status là Graded thì có nút Review)
                * Review: khi nhấn vào nút Review sẽ chuyển sang .../teacher/exams/mcq/{ExamID}/review/{SubmissionID}
                    * FullName(Student)(bên dưới là Title Exam, SubmitedAt), thẻ Final Score(điểm/10), Question Navigator, Submission Details: Content(nội dung câu hỏi số ..), đáp án Student chọn, đáp án đúng,... 
            
## III. Admin
* Sidebar có: Logo Admin, bên dưới là System Management, User Management, Log out
* .../admin/usermanagement (giao diện mặc định khi đăng nhập vào)
    * thanh search, filter(role: Teacher, Student)
    * nút Create New User, khi nhấn vào sẽ hiện form Create New User .../admin/create (có thể code nằm trong code usermanagement hoặc riêng ra 1 trang)
        * FullName, Email, System role, Password, nút Cancel và Create User
    * Tiêu đề User Management, bảng users: UserID, FullName, Email, Role, Actions(icon Edit, Delete)
        * khi nhấn icon Edit trường user được chọn sẽ cho phép chỉnh sửa FullName, Email, Role, Actions chuyển sang nút Save và Cancel
        * khi nhấn icon Delete sẽ hiện thông báo Delete User: có FullName của user, nút Cancel và Accept 
        
    