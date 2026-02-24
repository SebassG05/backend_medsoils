import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from '../config/index.js';
import routes from '../routes/index.js';

export default (app) => {
  // Security middleware
  app.use(helmet());
  
  // CORS middleware
  app.use(cors({
    origin: config.cors.origin,
    credentials: true,
  }));
  
  // Logging middleware
  if (config.env === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }
  
  // Body parsing middleware  (25 mb to support base64-encoded images in blog posts)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  
  // Static files
  app.use('/public', express.static('public'));
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
  
  // API routes
  app.use(config.api.prefix, routes);
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });
  
  // Error handler
  app.use((err, req, res, next) => {
    // Solo loggear errores internos, no errores operacionales esperados
    if (!err.isOperational) {
      console.error('❌ Error no esperado:', err);
    }
    
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
      success: false,
      message,
      // Solo mostrar stack en desarrollo Y si no es error operacional
      ...(config.env === 'development' && !err.isOperational && { stack: err.stack }),
    });
  });
  
  return app;
};
