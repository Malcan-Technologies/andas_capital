import axios from 'axios';
import config from '../config';
import { createCorrelatedLogger } from '../utils/logger';
import { mtsaClient } from './MTSAClient';
import { storageManager } from '../utils/storage';
import {
  SigningRequest,
  SigningResponse,
  EnrollmentRequest,
  EnrollmentResponse,
  SignerInfo,
  VerificationData,
  SignatureCoordinates,
  FieldUpdate,
} from '../types';

export class SigningService {
  /**
   * Process complete signing workflow from DocuSeal webhook
   */
  async processSigningWorkflow(
    request: SigningRequest,
    correlationId: string
  ): Promise<SigningResponse> {
    const log = createCorrelatedLogger(correlationId);
    
    try {
      log.info('Starting signing workflow', { 
        packetId: request.packetId,
        signerId: request.signerInfo.userId 
      });
      
      // Step 1: Check if user has a valid certificate
      const certInfo = await this.checkCertificateStatus(request.signerInfo.userId, correlationId);
      
      // Step 2: If no valid certificate, enroll the user
      if (!certInfo || certInfo.certStatus !== 'Valid') {
        log.info('Certificate not found or invalid, starting enrollment', { 
          signerId: request.signerInfo.userId,
          currentStatus: certInfo?.certStatus 
        });
        
        const enrollmentResult = await this.enrollUser(request.signerInfo, correlationId);
        if (!enrollmentResult.success) {
          return {
            success: false,
            message: 'Certificate enrollment failed',
            error: enrollmentResult.error,
          };
        }
      }
      
      // Step 3: Download unsigned PDF
      const pdfBase64 = await this.downloadPdfAsBase64(request.pdfUrl, correlationId);
      
      // Step 4: Request OTP for signing
      await this.requestSigningOTP(request.signerInfo.userId, request.signerInfo.emailAddress, correlationId);
      
      // Step 5: Wait for OTP (in real implementation, this would be handled via separate endpoint)
      // For now, we'll assume OTP is provided in the request or use a default flow
      
      // Step 6: Sign the PDF
      const signedResult = await this.signPdf(
        request.signerInfo,
        pdfBase64,
        request.templateId,
        request.otp,
        request.coordinates,
        request.signatureImage,
        request.fieldUpdates,
        correlationId
      );
      
      if (!signedResult.success) {
        return signedResult;
      }
      
      // Step 7: Store signed PDF
      const filePath = await storageManager.saveSignedPdf(
        signedResult.signedPdfBase64!,
        request.packetId,
        request.signerInfo.userId,
        correlationId
      );
      
      log.info('Signing workflow completed successfully', { 
        packetId: request.packetId,
        signerId: request.signerInfo.userId,
        filePath 
      });
      
      return {
        success: true,
        message: 'Document signed successfully',
        signedPdfPath: filePath,
        certificateInfo: signedResult.certificateInfo,
      };
      
    } catch (error) {
      log.error('Signing workflow failed', { 
        error: error instanceof Error ? error.message : String(error),
        packetId: request.packetId,
        signerId: request.signerInfo.userId 
      });
      
      return {
        success: false,
        message: 'Signing workflow failed',
        error: {
          code: 'WORKFLOW_ERROR',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
  
  /**
   * Check certificate status for a user
   */
  async checkCertificateStatus(userId: string, correlationId: string) {
    const log = createCorrelatedLogger(correlationId);
    
    try {
      log.debug('Checking certificate status', { userId });
      
      const result = await mtsaClient.getCertInfo({ UserID: userId }, correlationId);
      
      if (result.statusCode === '0000') {
        log.info('Certificate status retrieved', { 
          userId, 
          status: result.certStatus,
          validFrom: result.validFrom,
          validTo: result.validTo 
        });
        return result;
      } else {
        log.info('Certificate not found or error', { 
          userId, 
          statusCode: result.statusCode,
          message: result.message 
        });
        return null;
      }
    } catch (error) {
      log.warn('Error checking certificate status', { 
        userId,
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }
  
  /**
   * Enroll a new user and issue certificate
   */
  async enrollUser(signerInfo: SignerInfo, correlationId: string): Promise<EnrollmentResponse> {
    const log = createCorrelatedLogger(correlationId);
    
    try {
      log.info('Starting user enrollment', { userId: signerInfo.userId });
      
      // Step 1: Request OTP for enrollment
      const otpResult = await mtsaClient.requestEmailOTP({
        UserID: signerInfo.userId,
        OTPUsage: 'NU',
        EmailAddress: signerInfo.emailAddress,
      }, correlationId);
      
      if (otpResult.statusCode !== '0000') {
        return {
          success: false,
          message: 'Failed to send enrollment OTP',
          error: {
            code: 'OTP_FAILED',
            details: otpResult.message,
          },
        };
      }
      
      // Step 2: Create verification data (mock for now)
      const verificationData: VerificationData = {
        status: 'verified',
        datetime: new Date().toISOString(),
        verifier: 'system',
        method: 'ekyc_with_liveness',
        evidence: {
          // In real implementation, these would come from KYC process
          selfieImage: 'base64_selfie_data',
        },
      };
      
      // Step 3: Request certificate (assuming OTP is provided)
      // In real implementation, this would wait for OTP input
      const certResult = await mtsaClient.requestCertificate({
        UserID: signerInfo.userId,
        FullName: signerInfo.fullName,
        EmailAddress: signerInfo.emailAddress,
        MobileNo: signerInfo.mobileNo || '60123456789', // Default if not provided
        Nationality: signerInfo.nationality || 'MY',
        UserType: signerInfo.userType.toString(),
        IDType: 'N',
        AuthFactor: 'OTP_PLACEHOLDER', // In real implementation, get from user input
        VerificationData: {
          verifyDatetime: verificationData.datetime,
          verifyMethod: verificationData.method,
          verifyStatus: verificationData.status,
          verifyVerifier: verificationData.verifier,
        },
        SelfieImage: verificationData.evidence?.selfieImage,
      }, correlationId);
      
      if (certResult.statusCode === '0000') {
        log.info('User enrollment completed successfully', { 
          userId: signerInfo.userId,
          certSerialNo: certResult.certSerialNo 
        });
        
        return {
          success: true,
          message: 'Certificate enrolled successfully',
          certificateInfo: {
            serialNo: certResult.certSerialNo!,
            validFrom: certResult.validFrom!,
            validTo: certResult.validTo!,
            certificate: certResult.userCert!,
          },
        };
      } else {
        return {
          success: false,
          message: 'Certificate enrollment failed',
          error: {
            code: 'ENROLLMENT_FAILED',
            details: certResult.message,
          },
        };
      }
      
    } catch (error) {
      log.error('User enrollment failed', { 
        userId: signerInfo.userId,
        error: error instanceof Error ? error.message : String(error) 
      });
      
      return {
        success: false,
        message: 'Enrollment process failed',
        error: {
          code: 'ENROLLMENT_ERROR',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
  
  /**
   * Request OTP for digital signing
   */
  async requestSigningOTP(userId: string, emailAddress: string, correlationId: string): Promise<boolean> {
    const log = createCorrelatedLogger(correlationId);
    
    try {
      log.info('Requesting signing OTP', { userId });
      
      const result = await mtsaClient.requestEmailOTP({
        UserID: userId,
        OTPUsage: 'DS',
        EmailAddress: emailAddress,
      }, correlationId);
      
      const success = result.statusCode === '0000';
      log.info('Signing OTP request completed', { userId, success, message: result.message });
      
      return success;
    } catch (error) {
      log.error('Failed to request signing OTP', { 
        userId,
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }
  
  /**
   * Sign PDF document
   */
  async signPdf(
    signerInfo: SignerInfo,
    pdfBase64: string,
    templateId: string,
    otp?: string,
    coordinates?: SignatureCoordinates,
    signatureImage?: string,
    fieldUpdates?: FieldUpdate,
    correlationId?: string
  ): Promise<SigningResponse & { signedPdfBase64?: string }> {
    const log = createCorrelatedLogger(correlationId || 'unknown');
    
    try {
      log.info('Starting PDF signing', { 
        userId: signerInfo.userId,
        templateId,
        hasCoordinates: !!coordinates,
        hasSignatureImage: !!signatureImage 
      });
      
      // Get signature coordinates from template if not provided
      const sigCoordinates = coordinates || config.signatureCoordinates[templateId];
      const isVisible = !!sigCoordinates;
      
      // Prepare field updates with template variables
      const finalFieldUpdates: FieldUpdate = {
        CURR_DATE: new Date().toLocaleDateString('en-MY'),
        SIGNER_FULLNAME: signerInfo.fullName,
        SIGNER_ID: signerInfo.userId,
        ...fieldUpdates,
      };
      
      const signResult = await mtsaClient.signPDF({
        UserID: signerInfo.userId,
        FullName: signerInfo.fullName,
        AuthFactor: otp || 'OTP_PLACEHOLDER', // In real implementation, use actual OTP
        SignatureInfo: {
          pdfInBase64: pdfBase64,
          visibility: isVisible,
          coordinates: sigCoordinates,
          sigImageInBase64: signatureImage,
        },
        FieldListToUpdate: finalFieldUpdates,
      }, correlationId);
      
      if (signResult.statusCode === '0000') {
        log.info('PDF signing completed successfully', { 
          userId: signerInfo.userId,
          hasSignedPdf: !!signResult.signedPdfInBase64 
        });
        
        return {
          success: true,
          message: 'PDF signed successfully',
          signedPdfBase64: signResult.signedPdfInBase64,
          certificateInfo: {
            serialNo: 'extracted_from_cert', // Would extract from userCert
            validFrom: 'extracted_from_cert',
            validTo: 'extracted_from_cert',
            status: 'Valid',
          },
        };
      } else {
        return {
          success: false,
          message: 'PDF signing failed',
          error: {
            code: 'SIGNING_FAILED',
            details: signResult.message,
          },
        };
      }
      
    } catch (error) {
      log.error('PDF signing failed', { 
        userId: signerInfo.userId,
        error: error instanceof Error ? error.message : String(error) 
      });
      
      return {
        success: false,
        message: 'PDF signing process failed',
        error: {
          code: 'SIGNING_ERROR',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
  
  /**
   * Download PDF from URL and convert to base64
   */
  async downloadPdfAsBase64(pdfUrl: string, correlationId: string): Promise<string> {
    const log = createCorrelatedLogger(correlationId);
    
    try {
      log.info('Downloading PDF from URL', { pdfUrl });
      
      const response = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
        timeout: config.network.timeoutMs,
        headers: {
          'User-Agent': 'Signing-Orchestrator/1.0',
        },
      });
      
      const base64Data = Buffer.from(response.data).toString('base64');
      
      log.info('PDF downloaded and converted to base64', { 
        pdfUrl,
        sizeBytes: response.data.byteLength 
      });
      
      return base64Data;
    } catch (error) {
      log.error('Failed to download PDF', { 
        pdfUrl,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw new Error(`Failed to download PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Verify signed PDF
   */
  async verifySignedPdf(signedPdfBase64: string, correlationId: string) {
    const log = createCorrelatedLogger(correlationId);
    
    try {
      log.info('Verifying signed PDF');
      
      const result = await mtsaClient.verifyPDFSignature({
        SignedPdfInBase64: signedPdfBase64,
      }, correlationId);
      
      log.info('PDF verification completed', { 
        statusCode: result.statusCode,
        totalSignatures: result.totalSignatureInPdf 
      });
      
      return result;
    } catch (error) {
      log.error('PDF verification failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }
}

// Export singleton instance
export const signingService = new SigningService();
