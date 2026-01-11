from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api import auth, attributes, work_papers, conclusions
import os

# Create database tables
Base.metadata.create_all(bind=engine)

# Create uploads directory
os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="Audit Work Papers API", version="1.0.0", redirect_slashes=False)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(attributes.router, prefix="/api/attributes", tags=["attributes"])
app.include_router(work_papers.router, prefix="/api/work-papers", tags=["work-papers"])
app.include_router(conclusions.router, prefix="/api/conclusions", tags=["conclusions"])


@app.get("/")
def read_root():
    return {"message": "Audit Work Papers API"}
