import express from 'express';
import config from './config/index.js';
import loaders from './loaders/index.js';

async function startServer() {
  const app = express();
  
  // Initialize loaders
  await loaders(app);
  
  // Start server
  app.listen(config.port, () => {
    console.log(`
    ################################################
    🚀 Server listening on port: ${config.port}
    🌍 Environment: ${config.env}
    📡 API Prefix: ${config.api.prefix}
    ################################################
    `);
  }).on('error', (err) => {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  });
}

startServer();
