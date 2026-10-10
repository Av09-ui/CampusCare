import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.auth.routes import router as auth_router
from app.complaints.routes import (
    UPLOAD_DIR,
    admin_router,
    complaints_router,
)
from app.routes.admin_complaints import router as admin_complaints_router

app = FastAPI(
    title="CampusCare API",
    description="Backend API for the CampusCare college complaint platform.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth_router, prefix="/api")
app.include_router(complaints_router, prefix="/api")
app.include_router(admin_complaints_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "campuscare-backend",
    }


