# Script de instalacion para Windows PowerShell
Write-Host "Instalando dependencias del backend..." -ForegroundColor Cyan
Set-Location backend
npm install
Set-Location ..

Write-Host "Instalando dependencias del frontend..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

Write-Host ""
Write-Host "SIGUIENTE PASO:" -ForegroundColor Yellow
Write-Host "1. Copia .env.example a .env y agrega tus API keys"
Write-Host "2. Para iniciar el backend: cd backend && npm run dev"
Write-Host "3. Para iniciar el frontend: cd frontend && npm start"
Write-Host ""
Write-Host "Listo! 🎬" -ForegroundColor Green
