from fastapi import FastAPI

from app.auth.routes import router as auth_router

app = FastAPI(
    title="CampusCare API",
    description="Backend API for the CampusCare college complaint platform.",
    version="0.1.0",
)

app.include_router(auth_router, prefix="/api")


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "campuscare-backend",
    }
