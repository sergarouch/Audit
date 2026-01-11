# Audit Work Papers Application

A full-stack web application for managing audit work papers with automated compliance checking and CPA conclusion generation.

## Features

- **Manager Dashboard**: Create and manage audit attributes (validation rules and checklist criteria)
- **Auditor Dashboard**: Submit work papers with structured form data and file uploads
- **Automated Auditing**: System evaluates work papers against defined attributes
- **CPA Conclusions**: Generate detailed audit reports with compliance scores and recommendations
- **Role-Based Access**: Separate interfaces for managers and auditors

## Technology Stack

- **Backend**: Python FastAPI, SQLAlchemy, SQLite
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Authentication**: JWT-based with role management

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Register/Login**: Create an account as either a Manager or Auditor
2. **Managers**: Define audit attributes (validation rules and checklist criteria)
3. **Auditors**: Submit work papers with form data and file uploads
4. **Run Audits**: Trigger audits to generate compliance reports
5. **View Conclusions**: Review detailed CPA conclusions with findings and recommendations

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Database

The application uses SQLite by default. The database file (`audit_app.db`) will be created automatically in the backend directory on first run.

## File Uploads

Uploaded files are stored in the `backend/uploads` directory, organized by work paper ID.
