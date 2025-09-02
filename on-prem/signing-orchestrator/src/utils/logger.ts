import winston from 'winston';
import config from '../config';

// Custom format for correlation IDs and sanitization
const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
    // Sanitize sensitive data
    const sanitizedMeta = sanitizeLogData(meta);
    
    const baseEntry = {
      timestamp,
      level,
      message,
    };
    
    const correlationEntry = correlationId ? { correlationId } : {};
    const metaEntry = (sanitizedMeta && typeof sanitizedMeta === 'object') ? sanitizedMeta : {};
    
    const logEntry = Object.assign({}, baseEntry, correlationEntry, metaEntry);

    return config.logging.format === 'json' 
      ? JSON.stringify(logEntry)
      : `${timestamp} [${level.toUpperCase()}] ${correlationId ? `[${correlationId}] ` : ''}${message} ${Object.keys(sanitizedMeta).length ? JSON.stringify(sanitizedMeta) : ''}`;
  })
);

// Sanitize sensitive data from logs
function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveKeys = [
    'password', 'secret', 'token', 'auth', 'authorization', 'cookie',
    'nricfront', 'nricback', 'passportimage', 'selfieimage', 'otp',
    'certpin', 'newpin', 'pdfInBase64', 'signedPdfInBase64', 'sigImageInBase64'
  ];
  
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }
  
  return sanitized;
}

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: customFormat,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

// Add file transport in production
if (config.app.nodeEnv === 'production') {
  logger.add(new winston.transports.File({
    filename: '/var/log/signing-orchestrator/error.log',
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 5,
  }));
  
  logger.add(new winston.transports.File({
    filename: '/var/log/signing-orchestrator/combined.log',
    maxsize: 10485760, // 10MB
    maxFiles: 10,
  }));
}

// Helper function to create logger with correlation ID
export function createCorrelatedLogger(correlationId: string) {
  return {
    debug: (message: string, meta?: any) => logger.debug(message, { correlationId, ...meta }),
    info: (message: string, meta?: any) => logger.info(message, { correlationId, ...meta }),
    warn: (message: string, meta?: any) => logger.warn(message, { correlationId, ...meta }),
    error: (message: string, meta?: any) => logger.error(message, { correlationId, ...meta }),
  };
}

export default logger;
