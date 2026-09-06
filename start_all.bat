@echo off
echo ========================================================
echo Starting HydroSurge AI - Module 4 Integration Services
echo ========================================================

echo 1. Starting FastAPI Gateway on port 8000...
start "HydroSurge AI - FastAPI Gateway" cmd /k "python -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload"

echo 2. Starting Next.js Dashboard on port 3000...
cd dashboard
start "HydroSurge AI - Decision Dashboard" cmd /k "npm run dev -- -p 3000"

echo ========================================================
echo Services started successfully!
echo - API Docs:      http://localhost:8000/docs
echo - Health Check:  http://localhost:8000/api/v1/health
echo - Dashboard UI:  http://localhost:3000
echo ========================================================