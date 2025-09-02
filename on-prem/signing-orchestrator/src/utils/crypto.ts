import crypto from 'crypto';
import config from '../config';
import logger from './logger';

/**
 * Verify HMAC signature for webhook authentication
 */
export function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string = config.docuseal.webhookSecret
): boolean {
  try {
    // Remove 'sha256=' prefix if present
    const cleanSignature = signature.replace(/^sha256=/, '');
    
    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(cleanSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    logger.error('HMAC signature verification failed', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return false;
  }
}

/**
 * Generate HMAC signature for outbound webhooks
 */
export function generateHmacSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

/**
 * Generate correlation ID for request tracking
 */
export function generateCorrelationId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Hash sensitive data for logging (one-way)
 */
export function hashForLogging(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
    .substring(0, 8); // First 8 characters for brevity
}

/**
 * Validate base64 string
 */
export function isValidBase64(str: string): boolean {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch {
    return false;
  }
}

/**
 * Generate secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
