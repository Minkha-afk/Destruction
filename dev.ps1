<#
  Elevana — start every service + the frontend at once (Windows / PowerShell).

  Usage:
    ./dev.ps1            # open each service in its own titled window
    ./dev.ps1 -Unified   # run everything in THIS window with merged logs (needs `npm install` at root once)

  No arguments required. Run from the repo root.
#>

param(
  [switch]$Unified
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

$services = @(
  @{ Name = "auth";   Path = "backend/auth-services";  Port = 4000 },
  @{ Name = "chat";   Path = "backend/chat-service";   Port = 5000 },
  @{ Name = "course"; Path = "backend/course-service"; Port = 6100 },
  @{ Name = "search"; Path = "backend/search-service"; Port = 7000 },
  @{ Name = "web";    Path = "frontend/my-app";        Port = 3000 }
)

Write-Host ""
Write-Host "  Elevana launcher" -ForegroundColor Cyan
Write-Host "  ----------------" -ForegroundColor Cyan

# Warn about any service that hasn't been `npm install`-ed yet.
foreach ($s in $services) {
  if (-not (Test-Path (Join-Path $root "$($s.Path)/node_modules"))) {
    Write-Host "  ! $($s.Name): node_modules missing — run 'npm run install:all' first." -ForegroundColor Yellow
  }
}

if ($Unified) {
  if (-not (Test-Path (Join-Path $root "node_modules/concurrently"))) {
    Write-Host "  Installing root dependencies (concurrently)..." -ForegroundColor DarkGray
    npm install
  }
  Write-Host "  Starting all services with merged logs (Ctrl+C stops everything)..." -ForegroundColor Green
  npm run dev
  return
}

# Default: one window per service.
foreach ($s in $services) {
  $full = Join-Path $root $s.Path
  $cmd  = "`$Host.UI.RawUI.WindowTitle = 'Elevana · $($s.Name) (:$($s.Port))'; Set-Location '$full'; npm run dev"
  Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", $cmd | Out-Null
  Write-Host ("  -> {0,-7} http://localhost:{1}" -f $s.Name, $s.Port) -ForegroundColor Green
  Start-Sleep -Milliseconds 400
}

Write-Host ""
Write-Host "  All services launched in separate windows." -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Close each window (or Ctrl+C in it) to stop that service." -ForegroundColor DarkGray
Write-Host ""
