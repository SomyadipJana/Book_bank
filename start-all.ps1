# Book Bank - Full Project PowerShell Launcher
$rootDir = $PSScriptRoot

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "     Starting Book Bank Management System" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# 1. Backend
Write-Host "`n[1/3] Launching Backend API (Django :8001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; python manage.py migrate; python manage.py runserver 8001"

# 2. Search Microservice
Write-Host "[2/3] Launching Search Microservice (FastAPI :8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\book-search-api'; uvicorn main:app --reload --port 8000"

# 3. Frontend
Write-Host "[3/3] Launching Frontend (React/Vite :5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\book-bank-ui'; npm run dev"

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "All 3 services have been launched:" -ForegroundColor Green
Write-Host "  - Frontend:   http://localhost:5173" -ForegroundColor Green
Write-Host "  - Backend:    http://localhost:8001/api/" -ForegroundColor Green
Write-Host "  - Admin:      http://localhost:8001/admin/" -ForegroundColor Green
Write-Host "  - Search API: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

