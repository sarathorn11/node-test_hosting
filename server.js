import app from './src/app.js';
import https from 'https';
import fs from 'fs';
import helmet from 'helmet';

const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Health check endpoint (required by Render)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling for port binding
const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Production URL: https://your-service-name.onrender.com`);
  } else {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Development URL: http://localhost:${PORT}`);
  }
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// For HTTPS (optional)
const enableHTTPS = false; // Set to true if you need HTTPS in dev
if (enableHTTPS && process.env.NODE_ENV !== 'production') {
  const options = {
    key: fs.readFileSync('localhost.key'),
    cert: fs.readFileSync('localhost.crt')
  };
  https.createServer(options, app).listen(443, () => {
    console.log('HTTPS server running on port 443');
  });
}