$ErrorActionPreference = "Stop"

Write-Host "========================================================"
Write-Host " Manish Properties - cPanel Deployment Packaging Script"
Write-Host "========================================================"

$RootDir = Get-Location
$ScriptsDir = Join-Path $RootDir "scripts"

# Run Backend Prepare
python (Join-Path $ScriptsDir "prepare-backend.py")

# Run Frontend Prepare
node (Join-Path $ScriptsDir "prepare-frontend.js")

# Run Verification
python (Join-Path $ScriptsDir "verify-deployment.py")

Write-Host "========================================================"
Write-Host "✅ Deployment packaging complete!"
Write-Host "Your deployment files are ready in: $RootDir\deploy_packages"
Write-Host "========================================================"
