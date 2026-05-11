# 4. Individual Technical Defense

This section outlines the specific contributions, design justifications, and technical problem-solving processes for each member of the development team.

---

## 4.1. Technical Defense: Kha (Lead Database Architect & Advanced Features)

### Ownership
- **Database Architecture:** Designed the Polyglot Persistence architecture combining SQL Server (Relational) and MongoDB (Document).
- **Advanced T-SQL:** Authored all DML Triggers, Stored Procedures, Table-Valued Functions (TVF), Indexed Views, and Common Table Expressions (CTEs).
- **Data Integrity:** Designed the database schemas, seed data scripts, and cross-database synchronization logic.
- **Full-Stack Support:** Actively assisted in both Backend API integration and Frontend UI development, ensuring seamless data flow across the entire Polyglot architecture.

### Justification
I chose **Polyglot Persistence** over a monolithic SQL approach because our system handles two fundamentally different types of data. Core entities like `Users`, `Groups`, and `Submissions` require strict ACID compliance, Foreign Key constraints, and tabular structures, making SQL Server the perfect fit. Conversely, `Exam_Questions` and `Submission_Answers` vary wildly in structure (e.g., MCQ options vs. Essay paragraphs) and are better suited for MongoDB's schema-less JSON/BSON format. 

Furthermore, I chose to implement an **Indexed View** (`vw_StudentGroupScore`) to calculate total scores. Instead of forcing the system to run complex `SUM()` and `GROUP BY` operations on the `Submissions` table every time a dashboard is loaded, the Indexed View physicalizes the aggregated data on disk. This trades slightly slower write times (during grading) for instantaneous read performance, which perfectly aligns with an E-learning platform where reads drastically outnumber writes.

### Logic Walkthrough: `fn_GetGroupLeaderboard`
The following Table-Valued Function calculates a student's average grade and ranks them within their group using a CTE and a Window Function.

```sql
CREATE FUNCTION dbo.fn_GetGroupLeaderboard(@GroupID UNIQUEIDENTIFIER)
RETURNS TABLE AS RETURN (
    WITH GroupScores AS (
        SELECT StudentID,
               SUM(TotalScoreSum) / NULLIF(SUM(GradedExamsCount), 0) AS AverageGrade
        FROM dbo.vw_StudentGroupScore
        WHERE GroupID = @GroupID
        GROUP BY StudentID
    )
    SELECT StudentID, 
           AverageGrade,
           RANK() OVER (ORDER BY AverageGrade DESC) AS RankPosition
    FROM GroupScores
);
```
**Step-by-step Execution Logic:**
1. **CTE Definition (`GroupScores`):** The query first filters the pre-aggregated `vw_StudentGroupScore` view for the specific `@GroupID`.
2. **Safe Division:** It calculates the `AverageGrade`. The `NULLIF` function is critical here; it prevents a fatal "Divide by Zero" error if the student has no graded exams yet, gracefully returning `NULL` instead.
3. **Window Function (`RANK()`):** The main query selects the calculated averages and applies the `RANK() OVER (ORDER BY AverageGrade DESC)` window function. Instead of grouping all data into a single scalar value, this function calculates the student's relative position (Rank) across the current "window" of the group's dataset in exactly `O(N log N)` time.

### AI Critique
When designing the Polyglot backend, I asked the AI how to ensure consistency when creating an exam across both SQL Server and MongoDB. The AI heavily recommended using a complex "Two-Phase Commit" (2PC) or a Distributed Transaction Coordinator (DTC). I recognized that implementing 2PC across two distinct database engines (SQL and NoSQL) is practically impossible and severely degrades performance. I manually corrected this by overriding the AI's pattern with a **Saga-lite Pattern** in Python: I explicitly insert the metadata into SQL Server first, then attempt the MongoDB insert. If MongoDB throws an exception, my Python code catches it and manually executes a `DELETE` query in SQL Server to "rollback" the metadata, keeping the system highly available and consistent without the massive overhead of 2PC.

---

## 4.2. Technical Defense: Hào (Backend Integration & API Development)

### Ownership
- **Backend Framework:** Configured and developed the FastAPI application.
- **Authentication:** Implemented JWT-based authentication, password hashing (SHA-256), and the RBAC (Role-Based Access Control) Middleware.
- **Business Logic APIs:** Authored endpoints for the Student Module (submitting exams, receiving notifications, accepting group invitations).

### Justification
I chose to use FastAPI's **Dependency Injection (`Depends`)** for our Role-Based Access Control (e.g., `_student = require_role("Student")`) instead of writing permission checks inside every single route function. This design choice adheres to the DRY (Don't Repeat Yourself) principle and ensures that permission boundaries are explicitly declared in the route signature, making the API surface self-documenting and much harder to accidentally expose to unauthorized users.

### Logic Walkthrough: `submit_exam` Polyglot Synchronization
```python
@router.post("/exams/{exam_id}/submit")
async def submit_exam(...):
    # ... validation logic ...
    
    # Step 1: Insert into SQL Server and get ID
    result = conn.execute(text("""
        INSERT INTO Submissions (ExamID, StudentID, TotalScore, Status)
        OUTPUT INSERTED.SubmissionID
        VALUES (:eid, :uid, :score, :status)
    """), {"eid": exam_id, "uid": uid, "score": total_score, "status": status})
    
    submission_id = str(result.fetchone().SubmissionID)
    conn.commit()
    
    # Step 2: Insert unstructured data into MongoDB
    await mongo["Submission_Answers"].insert_one({
        "_id": submission_id,
        "examId": exam_id,
        "answers": answers_detail
    })
```
**Step-by-step Execution Logic:**
1. **SQL Execution with `OUTPUT`:** Rather than running an `INSERT` and then a secondary `SELECT` to find the newly created record's ID, the query uses `OUTPUT INSERTED.SubmissionID` to retrieve the generated UUID in a single database round-trip.
2. **Commit Boundary:** `conn.commit()` is explicitly called to finalize the SQL transaction, ensuring the Submission record definitively exists before touching the NoSQL layer.
3. **Primary Key Linking:** The `submission_id` generated by SQL Server is explicitly passed into MongoDB as the `_id` field. This enforces a strict 1:1 mapped relationship between the relational metadata and the NoSQL document data.

### AI Critique
When initially generating the database connections, the AI generated the backend using entirely synchronous drivers for MongoDB (`pymongo`) alongside the synchronous SQL Server driver (`pyodbc`). I realized that using synchronous I/O for MongoDB in a FastAPI application would block the ASGI event loop, neutralizing the performance benefits of FastAPI. I manually intervened to discard `pymongo` and rewrite the MongoDB integration using `motor` (AsyncIOMotorClient). I then optimized the routes to use `async def`, allowing the server to handle thousands of concurrent requests while waiting for MongoDB responses.

---

## 4.3. Technical Defense: Nhật (Frontend Architecture & UI/UX Integration)

### Ownership
- **Frontend Architecture:** Bootstrapped the React/Vite application and orchestrated the complete migration to TypeScript.
- **API Connectivity:** Implemented Axios interceptors for automated JWT injection and global error handling.
- **Teacher UI/UX:** Developed the Group Management, Exam Creation, and Analytics Dashboard interfaces.

### Justification
I chose to migrate the entire frontend from JavaScript to **TypeScript**. While it required a significant upfront investment in typing complex data structures, it was absolutely necessary for a Polyglot system. Because our APIs return a hybrid of SQL metadata and nested MongoDB documents, relying on dynamic JavaScript objects led to frequent "undefined property" crashes. By defining strict TypeScript `interfaces` (like `ApiGroup` and `ExamDetails`), I forced the compiler to catch property mismatches during build time, leading to a drastically more stable application.

### Logic Walkthrough: Automated Email Appending in `CreateGroupModal`
```typescript
const handleCreateGroup = () => {
  const trimmedGroupName = groupName.trim();
  if (!trimmedGroupName) return;

  const trimmedEmail = emailInput.trim();
  const finalEmails = [...emailChips];
  
  if (trimmedEmail) {
    finalEmails.push(trimmedEmail);
  }

  onCreateGroup(trimmedGroupName, finalEmails);
  resetForm();
  onClose();
};
```
**Step-by-step Execution Logic:**
1. **Validation:** The function first extracts and validates the core requirement (the Group Name).
2. **State Copying:** It creates a shallow copy of the `emailChips` array (the visual list of emails the user explicitly added).
3. **UX Optimization (The Catch):** It checks the active text input box (`emailInput`). If the user typed an email but forgot to click the "Add" button, it intercepts that dangling input and appends it to `finalEmails`.
4. **Transmission:** The finalized, comprehensive payload is sent to the parent component for API transmission.

### AI Critique
During the development of the Teacher module, the AI generated a basic form submission logic for `CreateGroupModal`. However, the AI-generated code included a strict blocker: `if (!trimmedGroupName || emailChips.length === 0) return;`. This logic had a severe UX flaw—it completely prevented teachers from creating an empty group, and if a teacher typed an email into the input box but forgot to click "Add", clicking "Create Group" did absolutely nothing without showing an error. I had to manually critique and rewrite this validation flow to remove the artificial restriction, allowing empty groups to be created, and implemented the auto-appending logic described above to create a seamless user experience.
