"""
HydroSurge AI - Systems & API Integration (Module 4)
FastAPI Application Entrypoint
SIH PS 26071
Status: VERIFIED 🟢
"""
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import (
    event_router,
    health_router,
    inundation_router,
    rainfall_router,
    risk_router,
)

# Load environment variables
load_dotenv()

app = FastAPI(
    title="HydroSurge AI - API Integration (Module 4)",
    description="Unified API integration layer connecting Rainfall, Inundation, Risk, and Decision Engines.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for Dashboard/Frontend consumption
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes under /api/v1
app.include_router(health_router, prefix="/api/v1")
app.include_router(rainfall_router, prefix="/api/v1")
app.include_router(inundation_router, prefix="/api/v1")
app.include_router(risk_router, prefix="/api/v1")
app.include_router(event_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "service": "HydroSurge AI - Module 4 API Gateway",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health",
        "status": "VERIFIED 🟢",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("API_PORT", "8000"))
    uvicorn.run("api.main:app", host="0.0.0.0", port=port, reload=True)