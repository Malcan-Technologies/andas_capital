import express from 'express';
import multer from 'multer';
import { verifyApiKey } from '../middleware/auth';
import { createCorrelatedLogger } from '../utils/logger';
import { signingService } from '../services/SigningService';
import { mtsaClient } from '../services/MTSAClient';
import { storageManager } from '../utils/storage';
import { isValidBase64 } from '../utils/crypto';
import config from '../config';
import {
  SigningRequest,
  EnrollmentRequest,
  SignerInfo,
  VerificationData,
} from '../types';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: config.storage.maxUploadMB * 1024 * 1024, // Convert MB to bytes
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

/**
 * Manual signing endpoint
 * POST /api/sign
 */
router.post('/sign', verifyApiKey, async (req, res) => {
  const log = createCorrelatedLogger(req.correlationId!);
  
  try {
    const {
      packetId,
      documentId,
      templateId,
      signerInfo,
      pdfUrl,
      otp,
      coordinates,
      signatureImage,
      fieldUpdates,
    }: SigningRequest = req.body;
    
    // Validate required fields
    if (!packetId || !signerInfo || !pdfUrl) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: packetId, signerInfo, pdfUrl',
      });
    }
    
    // Validate signer info
    if (!signerInfo.userId || !signerInfo.fullName || !signerInfo.emailAddress) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required signer fields: userId, fullName, emailAddress',
      });
    }
    
    log.info('Processing manual signing request', { 
      packetId, 
      signerId: signerInfo.userId 
    });
    
    const result = await signingService.processSigningWorkflow({
      packetId,
      documentId: documentId || '',
      templateId: templateId || '',
      signerInfo,
      pdfUrl,
      otp,
      coordinates,
      signatureImage,
      fieldUpdates,
    }, req.correlationId!);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          signedPdfPath: result.signedPdfPath,
          certificateInfo: result.certificateInfo,
        },
        correlationId: req.correlationId,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
        correlationId: req.correlationId,
      });
    }
    
  } catch (error) {
    log.error('Manual signing request failed', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Signing request failed',
      correlationId: req.correlationId,
    });
  }
});

/**
 * Certificate enrollment endpoint
 * POST /api/enroll
 */
router.post('/enroll', verifyApiKey, async (req, res) => {
  const log = createCorrelatedLogger(req.correlationId!);
  
  try {
    const {
      signerInfo,
      verificationData,
      otp,
    }: EnrollmentRequest = req.body;
    
    // Validate required fields
    if (!signerInfo || !verificationData) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: signerInfo, verificationData',
      });
    }
    
    // Validate signer info
    if (!signerInfo.userId || !signerInfo.fullName || !signerInfo.emailAddress) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required signer fields: userId, fullName, emailAddress',
      });
    }
    
    log.info('Processing enrollment request', { signerId: signerInfo.userId });
    
    const result = await signingService.enrollUser(signerInfo, req.correlationId!);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          certificateInfo: result.certificateInfo,
        },
        correlationId: req.correlationId,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
        correlationId: req.correlationId,
      });
    }
    
  } catch (error) {
    log.error('Enrollment request failed', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Enrollment request failed',
      correlationId: req.correlationId,
    });
  }
});

/**
 * PDF verification endpoint
 * POST /api/verify
 */
router.post('/verify', upload.single('pdf'), verifyApiKey, async (req, res) => {
  const log = createCorrelatedLogger(req.correlationId!);
  
  try {
    let pdfBase64: string;
    
    // Handle file upload or base64 data
    if (req.file) {
      pdfBase64 = req.file.buffer.toString('base64');
      log.debug('PDF uploaded via file', { size: req.file.size });
    } else if (req.body.pdfBase64) {
      if (!isValidBase64(req.body.pdfBase64)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid base64 PDF data',
        });
      }
      pdfBase64 = req.body.pdfBase64;
      log.debug('PDF provided as base64');
    } else {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No PDF provided (use file upload or pdfBase64 field)',
      });
    }
    
    log.info('Processing PDF verification request');
    
    const result = await signingService.verifySignedPdf(pdfBase64, req.correlationId!);
    
    res.status(200).json({
      success: result.statusCode === '0000',
      message: result.message,
      data: {
        statusCode: result.statusCode,
        totalSignatures: result.totalSignatureInPdf,
        signatureDetails: result.signatureDetails,
      },
      correlationId: req.correlationId,
    });
    
  } catch (error) {
    log.error('PDF verification request failed', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'PDF verification failed',
      correlationId: req.correlationId,
    });
  }
});

/**
 * Certificate info endpoint
 * GET /api/cert/:userId
 */
router.get('/cert/:userId', verifyApiKey, async (req, res) => {
  const log = createCorrelatedLogger(req.correlationId!);
  
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing userId parameter',
      });
    }
    
    log.info('Getting certificate info', { userId });
    
    const result = await mtsaClient.getCertInfo({ UserID: userId }, req.correlationId!);
    
    res.status(200).json({
      success: result.statusCode === '0000',
      message: result.message,
      data: {
        statusCode: result.statusCode,
        certStatus: result.certStatus,
        validFrom: result.validFrom,
        validTo: result.validTo,
        certSerialNo: result.certSerialNo,
        issuer: result.issuer,
        subject: result.subject,
      },
      correlationId: req.correlationId,
    });
    
  } catch (error) {
    log.error('Certificate info request failed', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get certificate info',
      correlationId: req.correlationId,
    });
  }
});

/**
 * Request OTP endpoint
 * POST /api/otp
 */
router.post('/otp', verifyApiKey, async (req, res) => {
  const log = createCorrelatedLogger(req.correlationId!);
  
  try {
    const { userId, usage, emailAddress } = req.body;
    
    if (!userId || !usage) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: userId, usage',
      });
    }
    
    if (!['DS', 'NU'].includes(usage)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid usage. Must be DS (digital signing) or NU (new enrollment)',
      });
    }
    
    if (usage === 'NU' && !emailAddress) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'emailAddress is required for new enrollment (NU)',
      });
    }
    
    log.info('Requesting OTP', { userId, usage });
    
    const result = await mtsaClient.requestEmailOTP({
      UserID: userId,
      OTPUsage: usage,
      EmailAddress: emailAddress,
    }, req.correlationId!);
    
    res.status(200).json({
      success: result.statusCode === '0000',
      message: result.message,
      data: {
        statusCode: result.statusCode,
        otpSent: result.otpSent,
      },
      correlationId: req.correlationId,
    });
    
  } catch (error) {
    log.error('OTP request failed', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'OTP request failed',
      correlationId: req.correlationId,
    });
  }
});

/**
 * List signed PDFs for a packet
 * GET /api/signed/:packetId
 */
router.get('/signed/:packetId', verifyApiKey, async (req, res) => {
  const log = createCorrelatedLogger(req.correlationId!);
  
  try {
    const { packetId } = req.params;
    
    if (!packetId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing packetId parameter',
      });
    }
    
    log.info('Listing signed PDFs', { packetId });
    
    const files = await storageManager.listSignedPdfs(packetId, req.correlationId!);
    
    // Get file stats for each file
    const fileDetails = await Promise.all(
      files.map(async (filePath) => {
        const stats = await storageManager.getFileStats(filePath);
        return {
          path: filePath,
          filename: filePath.split('/').pop(),
          size: stats?.size || 0,
          created: stats?.birthtime || null,
          modified: stats?.mtime || null,
        };
      })
    );
    
    res.status(200).json({
      success: true,
      message: 'Signed PDFs listed successfully',
      data: {
        packetId,
        files: fileDetails,
        count: fileDetails.length,
      },
      correlationId: req.correlationId,
    });
    
  } catch (error) {
    log.error('Failed to list signed PDFs', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to list signed PDFs',
      correlationId: req.correlationId,
    });
  }
});

export default router;
