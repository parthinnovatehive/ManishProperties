#!/bin/bash
set -e

echo "========================================================"
echo " Manish Properties - cPanel Deployment Packaging Script "
echo "========================================================"

ROOT_DIR=$(pwd)
SCRIPTS_DIR="$ROOT_DIR/scripts"

# Run Backend Prepare
python "$SCRIPTS_DIR/prepare-backend.py"

# Run Frontend Prepare
node "$SCRIPTS_DIR/prepare-frontend.js"

# Run Verification
python "$SCRIPTS_DIR/verify-deployment.py"

echo "========================================================"
echo "✅ Deployment packaging complete!"
echo "Your deployment files are ready in: $ROOT_DIR/deploy_packages"
echo "========================================================"
