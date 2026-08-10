const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const DEPLOY_DIR = path.join(ROOT_DIR, 'deploy_packages');
const FRONTEND_DEPLOY = path.join(DEPLOY_DIR, 'frontend');

function cleanDeployDir() {
    if (fs.existsSync(FRONTEND_DEPLOY)) {
        console.log(`Cleaning existing frontend deploy folder: ${FRONTEND_DEPLOY}`);
        fs.rmSync(FRONTEND_DEPLOY, { recursive: true, force: true });
    }
    fs.mkdirSync(FRONTEND_DEPLOY, { recursive: true });
}

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

function buildFrontend() {
    const envLocalPath = path.join(FRONTEND_DIR, '.env.local');
    const envLocalBakPath = path.join(FRONTEND_DIR, '.env.local.bak');
    let envLocalMoved = false;

    if (fs.existsSync(envLocalPath)) {
        console.log("Temporarily renaming .env.local to avoid interfering with production build...");
        fs.renameSync(envLocalPath, envLocalBakPath);
        envLocalMoved = true;
    }

    try {
        console.log("Installing frontend dependencies...");
        execSync('npm ci', { cwd: FRONTEND_DIR, stdio: 'inherit' });
        console.log("Building Next.js standalone application...");
        execSync('npm run build', { cwd: FRONTEND_DIR, stdio: 'inherit' });
    } finally {
        if (envLocalMoved) {
            console.log("Restoring .env.local...");
            fs.renameSync(envLocalBakPath, envLocalPath);
        }
    }
}

function packageFrontend() {
    const standaloneDir = path.join(FRONTEND_DIR, '.next/standalone');
    if (!fs.existsSync(standaloneDir)) {
        console.error("Error: .next/standalone folder not found. Make sure Next.js built successfully with output: 'standalone'.");
        process.exit(1);
    }

    console.log("Copying standalone build output...");
    copyRecursiveSync(standaloneDir, FRONTEND_DEPLOY);

    console.log("Setting up CloudPanel entrypoint (app.js)...");
    if (fs.existsSync(path.join(FRONTEND_DIR, "app.js"))) {
        fs.copyFileSync(path.join(FRONTEND_DIR, "app.js"), path.join(FRONTEND_DEPLOY, "app.js"));
    }

    console.log("Copying environment files and public folder...");
    if (fs.existsSync(path.join(FRONTEND_DIR, ".env.production"))) {
        fs.copyFileSync(path.join(FRONTEND_DIR, ".env.production"), path.join(FRONTEND_DEPLOY, ".env.production"));
    }
    if (fs.existsSync(path.join(FRONTEND_DIR, ".nvmrc"))) {
        fs.copyFileSync(path.join(FRONTEND_DIR, ".nvmrc"), path.join(FRONTEND_DEPLOY, ".nvmrc"));
    }
    if (fs.existsSync(path.join(FRONTEND_DIR, "public"))) {
        copyRecursiveSync(path.join(FRONTEND_DIR, "public"), path.join(FRONTEND_DEPLOY, "public"));
    }

    console.log("Copying Next.js static assets...");
    const staticDest = path.join(FRONTEND_DEPLOY, '.next/static');
    const staticSrc = path.join(FRONTEND_DIR, '.next/static');
    if (fs.existsSync(staticSrc)) {
        copyRecursiveSync(staticSrc, staticDest);
    }
}

function main() {
    console.log("=== Preparing Frontend Deployment ===");
    cleanDeployDir();
    buildFrontend();
    packageFrontend();
    console.log("Frontend packaged successfully.");
}

main();
