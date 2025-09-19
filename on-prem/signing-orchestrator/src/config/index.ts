import dotenv from 'dotenv';
import { OrchestratorConfig } from '../types';

// Load environment variables
dotenv.config();

function parseJson(value: string | undefined, defaultValue: any = {}): any {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

function parseArray(value: string | undefined, delimiter: string = ','): string[] {
  if (!value) return [];
  return value.split(delimiter).map(item => item.trim()).filter(Boolean);
}

export const config: OrchestratorConfig = {
  app: {
    port: parseInt(process.env.APP_PORT || '4010', 10),
    baseUrl: process.env.APP_BASE_URL || 'https://sign.kredit.my',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  docuseal: {
    baseUrl: process.env.DOCUSEAL_BASE_URL || 'https://sign.kredit.my:3001',
    webhookSecret: process.env.DOCUSEAL_WEBHOOK_HMAC_SECRET || '',
    apiToken: process.env.DOCUSEAL_API_TOKEN || '',
  },
  storage: {
    signedFilesDir: process.env.SIGNED_FILES_DIR || '/data/signed',
    stampedFilesDir: process.env.STAMPED_FILES_DIR || '/data/stamped',
    maxUploadMB: parseInt(process.env.MAX_UPLOAD_MB || '50', 10),
  },
  mtsa: {
    env: (process.env.MTSA_ENV as 'pilot' | 'prod') || 'pilot',
    wsdlPilot: process.env.MTSA_WSDL_PILOT || 'http://mtsa-pilot:8080/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl',
    wsdlProd: process.env.MTSA_WSDL_PROD || 'http://mtsa-prod:8080/MTSA/MyTrustSignerAgentWSAPv2?wsdl',
    username: process.env.MTSA_SOAP_USERNAME || '',
    password: process.env.MTSA_SOAP_PASSWORD || '',
  },
  network: {
    timeoutMs: parseInt(process.env.OUTBOUND_TIMEOUT_MS || '60000', 10),
    retryBackoffMs: parseInt(process.env.RETRY_BACKOFF_MS || '2000', 10),
    retryMax: parseInt(process.env.RETRY_MAX || '3', 10),
  },
  security: {
    corsOrigins: parseArray(process.env.CORS_ORIGINS, ','),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
  signatureCoordinates: parseJson(process.env.SIGNATURE_COORDINATES),
  notification: process.env.NOTIFICATION_WEBHOOK_URL ? {
    webhookUrl: process.env.NOTIFICATION_WEBHOOK_URL,
    webhookSecret: process.env.NOTIFICATION_WEBHOOK_SECRET || '',
  } : undefined,
};

// Validation
const requiredEnvVars = [
  'DOCUSEAL_WEBHOOK_HMAC_SECRET',
  'MTSA_SOAP_USERNAME',
  'MTSA_SOAP_PASSWORD',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export default config;
