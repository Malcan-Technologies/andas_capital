import soap from 'soap';
import config from '../config';
import logger, { createCorrelatedLogger } from '../utils/logger';
import {
  MTSARequestCertificateRequest,
  MTSARequestCertificateResponse,
  MTSAGetCertInfoRequest,
  MTSAGetCertInfoResponse,
  MTSASignPDFRequest,
  MTSASignPDFResponse,
  MTSAVerifyPDFRequest,
  MTSAVerifyPDFResponse,
  MTSARequestEmailOTPRequest,
  MTSARequestEmailOTPResponse,
  MTSARequestRevokeCertRequest,
  MTSARequestRevokeCertResponse,
} from '../types';

export class MTSAClient {
  private client: soap.Client | null = null;
  private wsdlUrl: string;
  private isInitialized = false;

  constructor() {
    this.wsdlUrl = config.mtsa.env === 'prod' ? config.mtsa.wsdlProd : config.mtsa.wsdlPilot;
  }

  /**
   * Initialize SOAP client connection
   */
  async initialize(correlationId?: string): Promise<void> {
    const log = correlationId ? createCorrelatedLogger(correlationId) : logger;
    
    if (this.isInitialized && this.client) {
      return;
    }

    try {
      log.info('Initializing MTSA SOAP client', { wsdlUrl: this.wsdlUrl, env: config.mtsa.env });
      
      this.client = await soap.createClientAsync(this.wsdlUrl, {
        timeout: config.network.timeoutMs,
        connection_timeout: config.network.timeoutMs,
      });

      // Set SOAP headers for authentication
      this.client.setSecurity(new soap.BasicAuthSecurity(config.mtsa.username, config.mtsa.password));
      
      this.isInitialized = true;
      log.info('MTSA SOAP client initialized successfully');
    } catch (error) {
      log.error('Failed to initialize MTSA SOAP client', { error: error instanceof Error ? error.message : String(error) });
      throw new Error(`MTSA SOAP client initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute SOAP method with retry logic
   */
  private async executeSoapMethod<T>(
    methodName: string,
    params: any,
    correlationId?: string
  ): Promise<T> {
    const log = correlationId ? createCorrelatedLogger(correlationId) : logger;
    
    await this.initialize(correlationId);
    
    if (!this.client) {
      throw new Error('SOAP client not initialized');
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= config.network.retryMax; attempt++) {
      try {
        log.debug(`Executing SOAP method: ${methodName} (attempt ${attempt})`, { params: { ...params, AuthFactor: '[REDACTED]' } });
        
        const [result] = await this.client[methodName + 'Async'](params);
        
        log.debug(`SOAP method ${methodName} completed successfully`, { 
          statusCode: result?.statusCode,
          hasResult: !!result 
        });
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        log.warn(`SOAP method ${methodName} failed (attempt ${attempt}/${config.network.retryMax})`, { 
          error: lastError.message 
        });
        
        if (attempt < config.network.retryMax) {
          const delay = config.network.retryBackoffMs * attempt;
          log.debug(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    log.error(`SOAP method ${methodName} failed after ${config.network.retryMax} attempts`, { 
      error: lastError?.message 
    });
    throw lastError || new Error(`SOAP method ${methodName} failed`);
  }

  /**
   * Request email OTP for certificate enrollment or digital signing
   */
  async requestEmailOTP(
    request: MTSARequestEmailOTPRequest,
    correlationId?: string
  ): Promise<MTSARequestEmailOTPResponse> {
    const log = correlationId ? createCorrelatedLogger(correlationId) : logger;
    
    log.info('Requesting email OTP', { 
      userId: request.UserID, 
      otpUsage: request.OTPUsage,
      hasEmail: !!request.EmailAddress 
    });

    const result = await this.executeSoapMethod<MTSARequestEmailOTPResponse>(
      'RequestEmailOTP',
      request,
      correlationId
    );

    log.info('Email OTP request completed', { 
      statusCode: result.statusCode, 
      success: result.statusCode === '0000' 
    });

    return result;
  }

  /**
   * Request certificate enrollment for a new user
   */
  async requestCertificate(
    request: MTSARequestCertificateRequest,
    correlationId?: string
  ): Promise<MTSARequestCertificateResponse> {
    const log = correlationId ? createCorrelatedLogger(correlationId) : logger;
    
    log.info('Requesting certificate enrollment', { 
      userId: request.UserID, 
      userType: request.UserType,
      nationality: request.Nationality 
    });

    const result = await this.executeSoapMethod<MTSARequestCertificateResponse>(
      'RequestCertificate',
      request,
      correlationId
    );

    log.info('Certificate enrollment completed', { 
      statusCode: result.statusCode, 
      success: result.statusCode === '0000',
      hasCertSerialNo: !!result.certSerialNo 
    });

    return result;
  }

  /**
   * Get certificate information and status
   */
  async getCertInfo(
    request: MTSAGetCertInfoRequest,
    correlationId?: string
  ): Promise<MTSAGetCertInfoResponse> {
    const log = correlationId ? createCorrelatedLogger(correlationId) : logger;
    
    log.info('Getting certificate info', { userId: request.UserID });

    const result = await this.executeSoapMethod<MTSAGetCertInfoResponse>(
      'GetCertInfo',
      request,
      correlationId
    );

    log.info('Certificate info retrieved', { 
      statusCode: result.statusCode, 
      success: result.statusCode === '0000',
      certStatus: result.certStatus 
    });

    return result;
  }

  /**
   * Sign PDF document with user's certificate
   */
  async signPDF(
    request: MTSASignPDFRequest,
    correlationId?: string
  ): Promise<MTSASignPDFResponse> {
    const log = correlationId ? createCorrelatedLogger(correlationId) : logger;
    
    log.info('Signing PDF document', { 
      userId: request.UserID,
      hasSignatureInfo: !!request.SignatureInfo,
      visibility: request.SignatureInfo?.visibility,
      hasFieldUpdates: !!request.FieldListToUpdate 
    });

    const result = await this.executeSoapMethod<MTSASignPDFResponse>(
      'SignPDF',
      request,
      correlationId
    );

    log.info('PDF signing completed', { 
      statusCode: result.statusCode, 
      success: result.statusCode === '0000',
      hasSignedPdf: !!result.signedPdfInBase64 
    });

    return result;
  }

  /**
   * Verify PDF signature validity
   */
  async verifyPDFSignature(
    request: MTSAVerifyPDFRequest,
    correlationId?: string
  ): Promise<MTSAVerifyPDFResponse> {
    const log = correlationId ? createCorrelatedLogger(correlationId) : logger;
    
    log.info('Verifying PDF signature');

    const result = await this.executeSoapMethod<MTSAVerifyPDFResponse>(
      'VerifyPDFSignature',
      request,
      correlationId
    );

    log.info('PDF signature verification completed', { 
      statusCode: result.statusCode, 
      success: result.statusCode === '0000',
      totalSignatures: result.totalSignatureInPdf 
    });

    return result;
  }

  /**
   * Request certificate revocation
   */
  async requestRevokeCert(
    request: MTSARequestRevokeCertRequest,
    correlationId?: string
  ): Promise<MTSARequestRevokeCertResponse> {
    const log = correlationId ? createCorrelatedLogger(correlationId) : logger;
    
    log.info('Requesting certificate revocation', { 
      userId: request.UserID,
      certSerialNo: request.CertSerialNo,
      revokeReason: request.RevokeReason,
      revokeBy: request.RevokeBy 
    });

    const result = await this.executeSoapMethod<MTSARequestRevokeCertResponse>(
      'RequestRevokeCert',
      request,
      correlationId
    );

    log.info('Certificate revocation completed', { 
      statusCode: result.statusCode, 
      success: result.statusCode === '0000',
      revoked: result.revoked 
    });

    return result;
  }

  /**
   * Check if SOAP client is healthy and can connect
   */
  async healthCheck(correlationId?: string): Promise<boolean> {
    const log = correlationId ? createCorrelatedLogger(correlationId) : logger;
    
    try {
      await this.initialize(correlationId);
      
      if (!this.client) {
        return false;
      }

      // Try to describe the service to verify connection
      const description = this.client.describe();
      const hasServices = Object.keys(description).length > 0;
      
      log.debug('MTSA SOAP health check completed', { hasServices });
      return hasServices;
    } catch (error) {
      log.warn('MTSA SOAP health check failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }

  /**
   * Close SOAP client connection
   */
  async close(): Promise<void> {
    if (this.client) {
      // SOAP client doesn't have explicit close method, just clear reference
      this.client = null;
      this.isInitialized = false;
      logger.info('MTSA SOAP client connection closed');
    }
  }
}

// Export singleton instance
export const mtsaClient = new MTSAClient();
