@echo off
echo 🚀 Starting HR Onboarding MVP...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose is not installed. Please install docker-compose and try again.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit .env file with your actual credentials before proceeding.
    echo    You can use demo values for testing.
    pause
)

REM Create logs directory
if not exist logs mkdir logs

echo 🐳 Building and starting Docker containers...
docker-compose up -d --build

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo 🔍 Checking service health...

REM Check backend health
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API is running at http://localhost:3001
) else (
    echo ❌ Backend API is not responding
)

REM Check frontend
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running at http://localhost:3000
) else (
    echo ❌ Frontend is not responding
)

echo.
echo 🎉 HR Onboarding MVP is ready!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:3001
echo 📊 Health Check: http://localhost:3001/health
echo.
echo 📋 Useful commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart: docker-compose restart
echo.
echo 📖 For more information, see README.md
pause
