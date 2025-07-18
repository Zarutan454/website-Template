# BSN Backend Start Script
# PowerShell script to start Django backend correctly

Write-Host "🚀 Starting BSN Backend..." -ForegroundColor Green

# Check if we're in the correct directory
if (-not (Test-Path "backend/manage.py")) {
    Write-Host "❌ Error: manage.py not found!" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory." -ForegroundColor Yellow
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Navigate to backend directory
Set-Location backend

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "   Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "📦 Activating virtual environment..." -ForegroundColor Blue
& ".\venv\Scripts\Activate.ps1"

# Install requirements if needed
if (-not (Test-Path "venv\Lib\site-packages\django")) {
    Write-Host "📦 Installing requirements..." -ForegroundColor Blue
    pip install -r requirements.txt
}

# Run migrations
Write-Host "🗄️ Running database migrations..." -ForegroundColor Blue
python manage.py migrate

# Start the server
Write-Host "🌐 Starting Django server on http://localhost:8000..." -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python manage.py runserver 8000 