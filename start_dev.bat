@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

echo.
echo ==========================================
echo    BSN System - Development Startup
echo ==========================================
echo.

REM Set absolute paths
set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "VENV_PATH=%BACKEND_DIR%\venv"
set "PYTHON_EXE=%VENV_PATH%\Scripts\python.exe"
set "PIP_EXE=%VENV_PATH%\Scripts\pip.exe"

echo [INFO] Project root: %PROJECT_ROOT%
echo [INFO] Backend dir: %BACKEND_DIR%
echo [INFO] Virtual env: %VENV_PATH%
echo.

REM === VALIDATION CHECKS ===
echo [VALIDATION] Checking project structure...

if not exist "%BACKEND_DIR%" (
    echo [ERROR] Backend directory not found at: %BACKEND_DIR%
    pause
    exit /b 1
)

if not exist "%PROJECT_ROOT%package.json" (
    echo [ERROR] Frontend package.json not found at: %PROJECT_ROOT%package.json
    pause
    exit /b 1
)

if not exist "%PYTHON_EXE%" (
    echo [ERROR] Virtual environment not found!
    echo [ERROR] Expected at: %PYTHON_EXE%
    echo.
    echo [SOLUTION] Please run the following commands first:
    echo   cd backend
    echo   python -m venv venv
    echo   venv\Scripts\activate
    echo   pip install -r requirements.txt
    echo   python manage.py migrate
    pause
    exit /b 1
)

if not exist "%BACKEND_DIR%\manage.py" (
    echo [ERROR] Django manage.py not found at: %BACKEND_DIR%\manage.py
    pause
    exit /b 1
)

if not exist "%BACKEND_DIR%\start_mining_system.py" (
    echo [ERROR] Mining system script not found at: %BACKEND_DIR%\start_mining_system.py
    pause
    exit /b 1
)

REM Check if npm is available
where npm >nul 2>nul
if !errorlevel! neq 0 (
    echo [ERROR] npm not found! Please install Node.js first.
    pause
    exit /b 1
)

echo [OK] All required files and dependencies found!
echo.

REM === TEST VIRTUAL ENVIRONMENT ===
echo [TEST] Testing virtual environment...
"%PYTHON_EXE%" -c "import django; print('Django version:', django.__version__)" 2>nul
if !errorlevel! neq 0 (
    echo [ERROR] Django not properly installed in virtual environment!
    echo [SOLUTION] Please run: cd backend && venv\Scripts\activate && pip install -r requirements.txt
    pause
    exit /b 1
)
echo [OK] Virtual environment is working correctly!
echo.

REM === START SERVICES ===
echo [INFO] Starting BSN Development Environment...
echo.

REM 1. Django Backend
echo [1/4] Starting Django Backend...
start "BSN Django Backend" cmd /k "cd /d "%BACKEND_DIR%" && echo [BACKEND] Activating virtual environment... && venv\Scripts\activate.bat && echo [BACKEND] Starting Django server... && python manage.py runserver 8000 || pause"

REM Wait for backend to initialize
echo [INFO] Waiting for Django backend to initialize...
timeout /t 8 /nobreak >nul

REM 2. Celery Mining System
echo [2/4] Starting Celery Mining System...
start "BSN Mining System" cmd /k "cd /d "%BACKEND_DIR%" && echo [MINING] Activating virtual environment... && venv\Scripts\activate.bat && echo [MINING] Starting Celery Mining System... && python start_mining_system.py --start || pause"

REM Wait for celery to initialize
echo [INFO] Waiting for Celery mining system to initialize...
timeout /t 6 /nobreak >nul

REM 3. React Frontend (Vite)
echo [3/4] Starting React Frontend (Vite)...
start "BSN React Frontend" cmd /k "cd /d "%PROJECT_ROOT%" && echo [FRONTEND] Starting Vite development server... && npm run dev || pause"

REM Wait for frontend
echo [INFO] Waiting for React frontend to initialize...
timeout /t 6 /nobreak >nul

REM 4. System Monitor
echo [4/4] Opening System Monitor...
start "BSN System Monitor" cmd /k "cd /d "%BACKEND_DIR%" && echo [MONITOR] Activating virtual environment... && venv\Scripts\activate.bat && echo. && echo ================================================ && echo            BSN SYSTEM MONITOR && echo ================================================ && echo. && echo Available Management Commands: && echo   python start_mining_system.py --status    # System status && echo   python start_mining_system.py --test      # Test heartbeat && echo   python manage.py shell                    # Django shell && echo   python manage.py migrate                  # Database migration && echo   python manage.py createsuperuser          # Create admin user && echo   python manage.py collectstatic            # Collect static files && echo. && echo [AUTO-CHECK] Running initial system status... && python start_mining_system.py --status"

echo.
echo ==========================================
echo     BSN SYSTEM STARTUP COMPLETE!
echo ==========================================
echo.
echo [SERVICES STARTED]
echo   1. Django Backend   - Port 8000
echo   2. Celery Mining    - Background worker  
echo   3. React Frontend   - Port 3000+ (Vite)
echo   4. System Monitor   - Management console
echo.
echo [ACCESS URLS]
echo   Frontend App:   http://localhost:3000
echo   Backend API:    http://localhost:8000
echo   Django Admin:   http://localhost:8000/admin  
echo   API Docs:       http://localhost:8000/api/
echo.
echo [MONITORING]
echo   - All services run in separate windows
echo   - Use System Monitor window for management commands
echo   - Close individual windows to stop specific services
echo   - Watch console output for any errors
echo.

REM Optional browser launch
set /p openBrowser="[OPTION] Open browser windows automatically? (y/n): "
if /i "!openBrowser!"=="y" (
    echo [BROWSER] Opening browser windows...
    timeout /t 10 /nobreak >nul
    start "" "http://localhost:3000"
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:8000"
    echo [BROWSER] Browser windows opened!
)

echo.
echo ==========================================
echo [SUCCESS] BSN Development Environment Ready!
echo [NEXT] All services are initializing...
echo [WAIT] Please wait 30-60 seconds for full startup
echo ==========================================
echo.
pause 