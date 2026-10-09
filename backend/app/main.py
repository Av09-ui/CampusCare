from fastapi import FastAPI

from app.auth.routes import router as auth_router
from app.routes.complaints import router as complaints_router
from app.routes.admin_complaints import router as admin_complaints_router

app = FastAPI(
    title="CampusCare API",
    description="Backend API for the CampusCare college complaint platform.",
    version="0.1.0",
)

app.include_router(auth_router, prefix="/api")
app.include_router(complaints_router, prefix="/api")
app.include_router(admin_complaints_router, prefix="/api")


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "campuscare-backend",
    }
