import express from 'express';
import sequelize from './models/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint REQUIRED for Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Database connection and server start
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Fatal: Database connection failed:', err);
    process.exit(1);
  });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});