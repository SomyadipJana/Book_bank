@echo off
title Book Bank - Full Project Launcher
echo ===================================================
echo     Starting Book Bank Management System
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Backend API (Django on http://localhost:8001)...
start "Book Bank - Backend (Django)" cmd /k "cd /d "%~dp0backend" && python manage.py migrate && python manage.py runserver 8001"

echo [2/3] Starting Search API (FastAPI on http://localhost:8000)...
start "Book Bank - Search API (FastAPI)" cmd /k "cd /d "%~dp0book-search-api" && uvicorn main:app --reload --port 8000"

echo [3/3] Starting Frontend (React + Vite on http://localhost:5173)...
start "Book Bank - Frontend (Vite)" cmd /k "cd /d "%~dp0book-bank-ui" && npm run dev"

echo.
echo ===================================================
echo All services are launching in separate windows:
echo   - Frontend:   http://localhost:5173
echo   - Backend:    http://localhost:8001/api/
echo   - Admin:      http://localhost:8001/admin/
echo   - Search API: http://localhost:8000/docs
echo ===================================================

