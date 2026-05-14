# E-learning Analytics System

## 1. Introduction
E-learning Analytics is an advanced online learning management platform designed to serve multi-dimensional interactions among Administrators (Admin), Instructors (Teacher), and Students. The system not only provides core classroom and examination management features but also applies complex data processing techniques to analyze learning performance.

The system is designed based on the principles of **Advanced Database Systems**, leveraging the power of data analytics techniques, concurrent transaction processing, and polyglot persistence architecture to deliver a seamless experience and the highest level of data integrity.

## 2. Architecture Overview
The system is cleanly decoupled into 3 independent subsystems (Frontend, Backend, Database), strictly adhering to the Client-Server model and a Micro-services-ready architecture:

*   **Frontend (React + TypeScript + Vite):**
    *   Modern user interface, built with React combined with TypeScript to ensure type-safety.
    *   Uses Axios with Interceptors to automatically manage and attach JWT Tokens in all transactions, securing the data flow.
*   **Backend (FastAPI + Python):**
    *   Built on the FastAPI framework, providing extremely high asynchronous processing performance.
    *   Provides strictly authorized RESTful APIs through RBAC (Role-Based Access Control) Middleware.
    *   Applies the Saga-lite pattern in Python code to ensure Consistency when communicating with multiple databases simultaneously.
*   **Database (Polyglot Persistence):**
    *   The Polyglot Architecture is the highlight of the system:
        *   **SQL Server (Relational DB):** Responsible for storing core data that requires high integrity and ACID properties (Users, Groups, Submissions). Applies advanced T-SQL techniques such as DML Triggers, Stored Procedures, Table-Valued Functions, and Indexed Views to optimize queries directly at the database level.
        *   **MongoDB (Document DB):** Responsible for storing unstructured and flexible data (Exam question contents, Detailed student answers). Uses the Aggregation Pipeline to retrieve data for Analytics charts.

## 3. Tools Required and Setup Guide

### Tools Required
To run the entire system, your computer needs to have the following software installed:
1. **Docker Desktop** (To run the SQL Server and MongoDB environments)
2. **Python 3.10+** (For the FastAPI Backend)
3. **Node.js (version 18+) & npm** (For the React Frontend)

### Setup & Run Instructions

**Step 1: Start the Database (Docker)**
Open a terminal in the project's root directory (`CK-HCSDLNC`) and run the following command:
```bash
docker-compose up -d
```
*(The schema initialization and seed data scripts will be automatically executed by SQL Server during the first startup).*

**Step 2: Start the Backend (FastAPI)**
Open a new terminal, navigate into the `BE` directory:
```bash
cd BE
# (Optional) Activate a virtual environment: python -m venv venv && source venv/Scripts/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*The Backend will run at: `http://localhost:8000` (Visit `http://localhost:8000/docs` to view the Swagger UI API).*

**Step 3: Start the Frontend (React/Vite)**
Open a new terminal, navigate into the `FE` directory:
```bash
cd FE
npm install
npm run dev
```
*The Frontend will automatically start and can be accessed at: `http://localhost:5173`*

## 4. Test Accounts
The system has been pre-initialized (Seed Data) with accounts covering different roles for convenient testing.

All accounts below share the same default password:
**`123456`**

*   **Admin:** `admin@elearning.com` (Manages users across the entire system)
*   **Teacher:** `teacher@elearning.com` (Creates groups, exams, grades essay questions, views Analytics)
*   **Student 1:** `student1@elearning.com` (Receives group invitations, takes exams, views grades)
*   **Student 2:** `student2@elearning.com` (A secondary student account for testing)
