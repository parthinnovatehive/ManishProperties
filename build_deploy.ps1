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
if (-not (Test-Path "node_modules")) {
    npm ci
} else {
    Write-Host "node_modules exists, skipping npm ci for speed..."
}

Write-Host "Cleaning Next.js cache to ensure a clean production build..."
if (Test-Path ".next") {
    node -e "fs.rmSync('.next', {recursive:true, force:true})"
}

Write-Host "Building Next.js (Standalone Mode)..."
$env:NODE_ENV="production"
$env:NEXT_TELEMETRY_DISABLED="1"
npm run build

Write-Host "Verifying production chunks..."
$localhostMatches = Get-ChildItem -Path ".next" -Recurse -File -Include "*.js","*.html","*.json" | Where-Object { $_.FullName -notmatch "cache" } | Select-String -Pattern "http://localhost:5000" -Quiet

if ($localhostMatches -contains $true) {
    Write-Host "ERROR: Found localhost:5000 in production build!" -ForegroundColor Red
    exit 1
}

$prodApiMatches = Get-ChildItem -Path ".next/static/chunks" -Recurse -File -Include "*.js" | Select-String -Pattern "https://api.manishpropertyconsultant.in" -Quiet
if (-not ($prodApiMatches -contains $true)) {
    Write-Host "ERROR: Production API URL not found in client chunks!" -ForegroundColor Red
    exit 1
}
Write-Host "Verification passed: No local URL found, Production API URL confirmed."

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
        if ($item -eq ".next") {
            New-Item -ItemType Directory -Force -Path (Join-Path $FrontendDeploy ".next") | Out-Null
            Get-ChildItem -Path $srcPath | Where-Object { $_.Name -ne "cache" } | Copy-Item -Destination (Join-Path $FrontendDeploy ".next") -Recurse -Force
        } else {
            Copy-Item -Path $srcPath -Destination $FrontendDeploy -Recurse -Force
        }
    }
}

# The standalone static assets need to be copied into the standalone folder
$StandaloneStaticDest = Join-Path $FrontendDeploy ".next/standalone/.next/static"
if (-not (Test-Path $StandaloneStaticDest)) {
    New-Item -ItemType Directory -Force -Path $StandaloneStaticDest | Out-Null
}
Copy-Item -Path (Join-Path $FrontendSource ".next/static/*") -Destination $StandaloneStaticDest -Recurse -Force

# The standalone public assets need to be copied into the standalone folder
$StandalonePublicDest = Join-Path $FrontendDeploy ".next/standalone/public"
if (-not (Test-Path $StandalonePublicDest)) {
    New-Item -ItemType Directory -Force -Path $StandalonePublicDest | Out-Null
}
Copy-Item -Path (Join-Path $FrontendSource "public/*") -Destination $StandalonePublicDest -Recurse -Force

# The production env file needs to be in the standalone folder
Copy-Item -Path (Join-Path $FrontendSource ".env.production") -Destination (Join-Path $FrontendDeploy ".next/standalone/.env.production") -Force

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
