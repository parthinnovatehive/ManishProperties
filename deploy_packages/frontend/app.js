function validateEnv() {
  const required = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    const message = `Missing required frontend environment variables: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') {
      console.error(JSON.stringify({ level: 'error', message, timestamp: new Date().toISOString() }));
      process.exit(1);
    } else {
      console.warn(`[WARNING] ${message}`);
    }
  }
}

// Validate environment before starting Next.js standalone server
validateEnv();

// Start the standalone server
const path = require('path');
require(path.join(__dirname, "server.js"));
