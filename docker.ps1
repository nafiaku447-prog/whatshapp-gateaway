# WA Gateway Docker Helper Script
# Script untuk memudahkan operasi Docker

param(
    [Parameter(Position = 0)]
    [string]$Command = "help"
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host "`n=== WA Gateway - Docker Helper Script ===`n" -ForegroundColor Cyan
    Write-Host "Usage: .\docker.ps1 [command]`n" -ForegroundColor White
    
    Write-Host "Available commands:" -ForegroundColor Yellow
    Write-Host "  setup      - Setup environment file (.env)" -ForegroundColor Green
    Write-Host "  build      - Build Docker images" -ForegroundColor Green
    Write-Host "  start      - Start all containers" -ForegroundColor Green
    Write-Host "  stop       - Stop all containers" -ForegroundColor Green
    Write-Host "  restart    - Restart all containers" -ForegroundColor Green
    Write-Host "  logs       - Show container logs" -ForegroundColor Green
    Write-Host "  status     - Show container status" -ForegroundColor Green
    Write-Host "  clean      - Stop and remove all containers" -ForegroundColor Green
    Write-Host "  rebuild    - Rebuild and restart containers" -ForegroundColor Green
    Write-Host "  backup-db  - Backup database" -ForegroundColor Green
    Write-Host "  shell      - Access backend container shell" -ForegroundColor Green
    Write-Host "  psql       - Access PostgreSQL shell" -ForegroundColor Green
    Write-Host "  help       - Show this help message`n" -ForegroundColor Green
}

function Initialize-Environment {
    Write-Host "`n[SETUP] Setting up environment file...`n" -ForegroundColor Cyan
    
    if (Test-Path ".env") {
        Write-Host "[ERROR] .env file already exists!" -ForegroundColor Red
        $overwrite = Read-Host "Do you want to overwrite? (y/N)"
        if ($overwrite -ne "y") {
            Write-Host "Setup cancelled." -ForegroundColor Yellow
            return
        }
    }
    
    Copy-Item ".env.docker" ".env"
    Write-Host "[SUCCESS] Created .env file from template" -ForegroundColor Green
    Write-Host "`n[IMPORTANT] Edit .env file and change:" -ForegroundColor Yellow
    Write-Host "   - DB_PASSWORD" -ForegroundColor Yellow
    Write-Host "   - JWT_SECRET" -ForegroundColor Yellow
    Write-Host "   - SMTP_USER and SMTP_PASS`n" -ForegroundColor Yellow
}

function Invoke-Build {
    Write-Host "`n[BUILD] Building Docker images...`n" -ForegroundColor Cyan
    docker-compose build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[SUCCESS] Build completed successfully!`n" -ForegroundColor Green
    }
    else {
        Write-Host "`n[ERROR] Build failed!`n" -ForegroundColor Red
    }
}

function Start-Containers {
    Write-Host "`n[START] Starting containers...`n" -ForegroundColor Cyan
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[SUCCESS] Containers started successfully!`n" -ForegroundColor Green
        Write-Host "Access the application at: http://localhost:5000" -ForegroundColor Cyan
        Write-Host "API endpoint: http://localhost:5000/api`n" -ForegroundColor Cyan
    }
    else {
        Write-Host "`n[ERROR] Failed to start containers!`n" -ForegroundColor Red
    }
}

function Stop-Containers {
    Write-Host "`n[STOP] Stopping containers...`n" -ForegroundColor Cyan
    docker-compose stop
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[SUCCESS] Containers stopped successfully!`n" -ForegroundColor Green
    }
    else {
        Write-Host "`n[ERROR] Failed to stop containers!`n" -ForegroundColor Red
    }
}

function Restart-Containers {
    Write-Host "`n[RESTART] Restarting containers...`n" -ForegroundColor Cyan
    docker-compose restart
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[SUCCESS] Containers restarted successfully!`n" -ForegroundColor Green
    }
    else {
        Write-Host "`n[ERROR] Failed to restart containers!`n" -ForegroundColor Red
    }
}

function Show-Logs {
    Write-Host "`n[LOGS] Showing container logs (Press Ctrl+C to exit)...`n" -ForegroundColor Cyan
    docker-compose logs -f
}

function Show-Status {
    Write-Host "`n[STATUS] Container Status:`n" -ForegroundColor Cyan
    docker-compose ps
    Write-Host ""
}

function Clear-Containers {
    Write-Host "`n[CLEAN] Cleaning up containers...`n" -ForegroundColor Cyan
    $confirm = Read-Host "This will stop and remove all containers. Continue? (y/N)"
    if ($confirm -eq "y") {
        docker-compose down
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n[SUCCESS] Cleanup completed!`n" -ForegroundColor Green
        }
        else {
            Write-Host "`n[ERROR] Cleanup failed!`n" -ForegroundColor Red
        }
    }
    else {
        Write-Host "Cleanup cancelled." -ForegroundColor Yellow
    }
}

function Reset-Containers {
    Write-Host "`n[REBUILD] Rebuilding and restarting containers...`n" -ForegroundColor Cyan
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[SUCCESS] Rebuild completed successfully!`n" -ForegroundColor Green
        Write-Host "Access the application at: http://localhost:5000`n" -ForegroundColor Cyan
    }
    else {
        Write-Host "`n[ERROR] Rebuild failed!`n" -ForegroundColor Red
    }
}

function Backup-Database {
    Write-Host "`n[BACKUP] Creating database backup...`n" -ForegroundColor Cyan
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $filename = "backup_$timestamp.sql"
    
    docker exec waapi-postgres pg_dump -U waapi_user waapi_db > $filename
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Database backed up to: $filename`n" -ForegroundColor Green
    }
    else {
        Write-Host "[ERROR] Backup failed!`n" -ForegroundColor Red
    }
}

function Open-Shell {
    Write-Host "`n[SHELL] Opening backend container shell...`n" -ForegroundColor Cyan
    docker exec -it waapi-backend sh
}

function Open-PostgreSQL {
    Write-Host "`n[PSQL] Opening PostgreSQL shell...`n" -ForegroundColor Cyan
    docker exec -it waapi-postgres psql -U waapi_user -d waapi_db
}

# Main switch
switch ($Command.ToLower()) {
    "setup" { Initialize-Environment }
    "build" { Invoke-Build }
    "start" { Start-Containers }
    "stop" { Stop-Containers }
    "restart" { Restart-Containers }
    "logs" { Show-Logs }
    "status" { Show-Status }
    "clean" { Clear-Containers }
    "rebuild" { Reset-Containers }
    "backup-db" { Backup-Database }
    "shell" { Open-Shell }
    "psql" { Open-PostgreSQL }
    "help" { Show-Help }
    default { 
        Write-Host "`n[ERROR] Unknown command: $Command`n" -ForegroundColor Red
        Show-Help 
    }
}
