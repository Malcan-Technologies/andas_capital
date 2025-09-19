import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config';
import logger from './utils/logger';
import { correlationIdMiddleware, errorHandler } from './middleware/auth';

// Import routes
import webhooksRouter from './routes/webhooks';
import apiRouter from './routes/api';
import healthRouter from './routes/health';

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: config.security.corsOrigins.length > 0 ? config.security.corsOrigins : false,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Global middleware
app.use(correlationIdMiddleware);

// Raw body parsing for PDF uploads (must come before general body parsing)
app.use('/api/admin/agreements/:applicationId/upload/stamped', express.raw({ 
  type: 'application/pdf', 
  limit: `${config.storage.maxUploadMB}mb` 
}));
app.use('/api/admin/agreements/:applicationId/upload/certificate', express.raw({ 
  type: 'application/pdf', 
  limit: `${config.storage.maxUploadMB}mb` 
}));

// General body parsing middleware
app.use(express.json({ limit: `${config.storage.maxUploadMB}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${config.storage.maxUploadMB}mb` }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    correlationId: req.correlationId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
  next();
});

// Routes
app.use('/health', healthRouter);
app.use('/webhooks', webhooksRouter);
app.use('/api', apiRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Signing Orchestrator',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: config.app.nodeEnv,
    correlationId: req.correlationId,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    correlationId: req.correlationId,
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, starting graceful shutdown');
  
  // Close server
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close other connections (SOAP client, etc.)
    process.exit(0);
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, starting graceful shutdown');
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise.toString(),
  });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  
  // Exit process after logging
  process.exit(1);
});

// Start server
const server = app.listen(config.app.port, () => {
  logger.info('Signing Orchestrator started', {
    port: config.app.port,
    environment: config.app.nodeEnv,
    mtsaEnv: config.mtsa.env,
    baseUrl: config.app.baseUrl,
    docusealUrl: config.docuseal.baseUrl,
    storageDir: config.storage.signedFilesDir,
  });
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${config.app.port} is already in use`);
  } else {
    logger.error('Server error', { error: error.message, code: error.code });
  }
  process.exit(1);
});

export default app;
