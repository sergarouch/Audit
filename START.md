# How to Run the Audit Work Papers Application

## Quick Start Guide

### Step 1: Start the Backend (Terminal 1)

1. Open a terminal/command prompt
2. Navigate to the backend directory:
   ```
   cd C:\Users\Serg\audit-work-papers-app\backend
   ```

3. Create a virtual environment (first time only):
   ```
   python -m venv venv
   ```

4. Activate the virtual environment:
   ```
   venv\Scripts\activate
   ```

5. Install dependencies (first time only):
   ```
   pip install -r requirements.txt
   ```

6. Start the backend server:
   ```
   uvicorn app.main:app --reload --port 8000
   ```

   You should see: `Uvicorn running on http://127.0.0.1:8000`

### Step 2: Start the Frontend (Terminal 2)

1. Open a **NEW** terminal/command prompt
2. Navigate to the frontend directory:
   ```
   cd C:\Users\Serg\audit-work-papers-app\frontend
   ```

3. Install dependencies (first time only):
   ```
   npm install
   ```

4. Start the frontend development server:
   ```
   npm run dev
   ```

   You should see: `Local: http://localhost:5173`

### Step 3: Access the Application

1. Open your web browser
2. Go to: **http://localhost:5173**
3. You should see the login page

### First Time Setup

1. **Register a new account** on the login page
2. Choose your role:
   - **Manager**: Can create and manage audit attributes
   - **Auditor**: Can submit work papers
3. Log in with your credentials

### API Documentation

- Backend API Docs: http://localhost:8000/docs
- API Root: http://localhost:8000

### Troubleshooting

- **Backend not starting**: Make sure Python is installed and virtual environment is activated
- **Frontend not starting**: Make sure Node.js and npm are installed
- **404 errors**: Make sure both backend (port 8000) and frontend (port 5173) are running
- **CORS errors**: Make sure backend is running on port 8000
