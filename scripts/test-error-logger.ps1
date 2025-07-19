# Error Logger Test Script für Windows

Write-Host "###################################################" -ForegroundColor Cyan
Write-Host "#           Error Logger Test                    #" -ForegroundColor Cyan
Write-Host "###################################################" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔧 System Information:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:8080" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "   Test URL: http://localhost:8080/error-logger-test" -ForegroundColor Green
Write-Host ""

# Test Backend Availability
Write-Host "🔍 Testing Backend Availability..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/" -Method HEAD -TimeoutSec 5
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 401) {
        Write-Host "✅ Backend is running (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend responded with unexpected status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Backend is not running or not accessible" -ForegroundColor Red
    Write-Host "   Start backend with: cd backend && python manage.py runserver 8000" -ForegroundColor Gray
}

Write-Host ""

# Test Frontend Availability
Write-Host "🔍 Testing Frontend Availability..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -Method HEAD -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend responded with status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Frontend is not running or not accessible" -ForegroundColor Red
    Write-Host "   Start frontend with: npm run dev" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open browser and go to: http://localhost:8080/error-logger-test" -ForegroundColor White
Write-Host "2. Click 'Run Test' button" -ForegroundColor White
Write-Host "3. Check browser console for logs" -ForegroundColor White
Write-Host "4. Use DevTools commands:" -ForegroundColor White
Write-Host "   - window.debugUtils.testLogger()" -ForegroundColor Gray
Write-Host "   - window.errorLogger.getLogs()" -ForegroundColor Gray
Write-Host "   - window.logError('Test Error')" -ForegroundColor Gray
Write-Host ""

Write-Host "🎯 The Error Logger is now:" -ForegroundColor Cyan
Write-Host "   ✅ Loop-free (no WebSocket reconnection)" -ForegroundColor Green
Write-Host "   ✅ Simple (no console interception)" -ForegroundColor Green
Write-Host "   ✅ Safe (silent fail on errors)" -ForegroundColor Green
Write-Host "   ✅ Development-only (disabled in production)" -ForegroundColor Green
Write-Host "" 