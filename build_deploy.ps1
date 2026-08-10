$ErrorActionPreference = "Stop"

Write-Host "========================================================"
Write-Host " Manish Properties - cPanel Deployment Packaging Script"
Write-Host "========================================================"

$RootFolder = Get-Location
$DeployFolder = Join-Path $RootFolder "deploy_packages"
$BackendDeploy = Join-Path $DeployFolder "backend"
$FrontendDeploy = Join-Path $DeployFolder "frontend"

# Clean up previous builds
if (Test-Path $DeployFolder) {
    Write-Host "Cleaning up previous deployment folder..."
    Remove-Item -Recurse -Force $DeployFolder
}

New-Item -ItemType Directory -Force -Path $BackendDeploy | Out-Null
New-Item -ItemType Directory -Force -Path $FrontendDeploy | Out-Null

# --------------------------------------------------------
# Backend Packaging
# --------------------------------------------------------
Write-Host "`n[1/3] Packaging Backend..."
$BackendSource = Join-Path $RootFolder "backend"
$BackendFilesToCopy = @(
    "app.py",
    "config.py",
    "passenger_wsgi.py",
    "requirements.txt",
    "wsgi.py",
    "__init__.py",
    "routes",
    "services",
    "middleware",
    "models",
    "utils"
)

foreach ($item in $BackendFilesToCopy) {
    $srcPath = Join-Path $BackendSource $item
    if (Test-Path $srcPath) {
        Copy-Item -Path $srcPath -Destination $BackendDeploy -Recurse -Force
    }
}
Write-Host "Backend packaging complete."

# --------------------------------------------------------
# Frontend Packaging
# --------------------------------------------------------
Write-Host "`n[2/3] Building & Packaging Frontend..."
$FrontendSource = Join-Path $RootFolder "frontend"

Set-Location $FrontendSource
Write-Host "Installing frontend dependencies..."
npm ci

Write-Host "Building Next.js (Standalone Mode)..."
npm run build

Write-Host "Copying frontend files to deployment folder..."
$FrontendFilesToCopy = @(
    "server.js",
    "app.js",
    "package.json",
    ".env.production",
    "public",
    ".next"
)

foreach ($item in $FrontendFilesToCopy) {
    $srcPath = Join-Path $FrontendSource $item
    if (Test-Path $srcPath) {
        Copy-Item -Path $srcPath -Destination $FrontendDeploy -Recurse -Force
    }
}

# The standalone static assets need to be copied into the standalone folder
$StandaloneStaticDest = Join-Path $FrontendDeploy ".next/standalone/.next/static"
if (-not (Test-Path $StandaloneStaticDest)) {
    New-Item -ItemType Directory -Force -Path $StandaloneStaticDest | Out-Null
}
Copy-Item -Path (Join-Path $FrontendSource ".next/static/*") -Destination $StandaloneStaticDest -Recurse -Force
Write-Host "Frontend packaging complete."

# --------------------------------------------------------
# Finish
# --------------------------------------------------------
Set-Location $RootFolder
Write-Host "`n========================================================"
Write-Host "✅ Deployment packaging complete!"
Write-Host "Your deployment files are ready in: $DeployFolder"
Write-Host ""
Write-Host "1. Upload contents of 'deploy_packages/backend' to your Python App root (e.g. /home/user/manish_backend)"
Write-Host "2. Upload contents of 'deploy_packages/frontend/.next/standalone' and 'server.js', 'app.js', 'public', etc. to your Node App root."
Write-Host "   (Note: For frontend, upload everything inside deploy_packages/frontend to your manish_frontend folder in cPanel)."
Write-Host "========================================================"
