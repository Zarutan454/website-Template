# BSN Frontend Start Script
# PowerShell script to start React frontend correctly

Write-Host "🚀 Starting BSN Frontend..." -ForegroundColor Green

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory." -ForegroundColor Yellow
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    npm install
}

# Set environment variables for development
$env:VITE_API_BASE_URL = "http://localhost:8000"
$env:VITE_DJANGO_API_URL = "http://localhost:8000/api"
$env:VITE_WS_URL = "ws://localhost:8000"
$env:VITE_MEDIA_BASE_URL = "http://localhost:8000"

Write-Host "🌐 Starting Vite development server on http://localhost:8080..." -ForegroundColor Green
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor Blue
Write-Host "   Frontend: http://localhost:8080" -ForegroundColor Blue
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev 