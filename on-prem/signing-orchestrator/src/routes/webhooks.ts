import express from 'express';
import { verifyDocuSealWebhook, rawBodyMiddleware } from '../middleware/auth';
import { createCorrelatedLogger } from '../utils/logger';
import { DocuSealWebhookPayload } from '../types';
import { signingService } from '../services/SigningService';

const router = express.Router();

/**
 * DocuSeal webhook endpoint
 * Handles signer_submitted and packet_completed events
 */
router.post('/docuseal', rawBodyMiddleware, verifyDocuSealWebhook, async (req, res) => {
  const log = createCorrelatedLogger(req.correlationId!);
  
  try {
    const payload: DocuSealWebhookPayload = JSON.parse(req.rawBody!.toString('utf8'));
    
    log.info('Received DocuSeal webhook', { 
      eventType: payload.event_type,
      dataId: payload.data?.id,
      packetId: payload.data?.packet_id 
    });
    
    // Validate required fields
    if (!payload.event_type || !payload.data) {
      log.warn('Invalid webhook payload structure');
      res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Invalid payload structure' 
      });
      return;
    }
    
    // Handle different event types
    switch (payload.event_type) {
      case 'signer_submitted':
        await handleSignerSubmitted(payload, req.correlationId!);
        break;
        
      case 'packet_completed':
        await handlePacketCompleted(payload, req.correlationId!);
        break;
        
      default:
        log.info('Unhandled webhook event type', { eventType: payload.event_type });
        break;
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      correlationId: req.correlationId 
    });
    
  } catch (error) {
    log.error('Error processing DocuSeal webhook', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to process webhook',
      correlationId: req.correlationId 
    });
  }
});

/**
 * Handle signer_submitted event
 * This triggers the signing process
 */
async function handleSignerSubmitted(payload: DocuSealWebhookPayload, correlationId: string): Promise<void> {
  const log = createCorrelatedLogger(correlationId);
  
  try {
    const { data } = payload;
    
    // Extract signer information
    const signerInfo = {
      userId: data.signer_nric || data.signer_passport || data.signer_id || '',
      fullName: data.signer_name || '',
      emailAddress: data.signer_email || '',
      mobileNo: '', // Will need to be provided separately or extracted from DocuSeal
      nationality: 'MY', // Default to Malaysia
      userType: 1 as const, // External borrower by default
    };
    
    // Validate required signer info
    if (!signerInfo.userId || !signerInfo.fullName || !signerInfo.emailAddress) {
      log.warn('Incomplete signer information in webhook', { 
        hasUserId: !!signerInfo.userId,
        hasFullName: !!signerInfo.fullName,
        hasEmail: !!signerInfo.emailAddress 
      });
      return;
    }
    
    // Create signing request
    const signingRequest = {
      packetId: data.packet_id || data.id || '',
      documentId: data.document_id || '',
      templateId: data.template_id || '',
      signerInfo,
      pdfUrl: data.unsigned_pdf_url || '',
    };
    
    log.info('Processing signer submission', { 
      packetId: signingRequest.packetId,
      signerId: signerInfo.userId 
    });
    
    // Start the signing workflow
    await signingService.processSigningWorkflow(signingRequest, correlationId);
    
  } catch (error) {
    log.error('Error handling signer_submitted event', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}

/**
 * Handle packet_completed event
 * This can be used for final processing or notifications
 */
async function handlePacketCompleted(payload: DocuSealWebhookPayload, correlationId: string): Promise<void> {
  const log = createCorrelatedLogger(correlationId);
  
  try {
    const { data } = payload;
    
    log.info('Processing packet completion', { 
      packetId: data.packet_id || data.id,
      status: data.status 
    });
    
    // Here you could:
    // 1. Send completion notifications
    // 2. Update external systems
    // 3. Archive documents
    // 4. Generate reports
    
    // For now, just log the completion
    log.info('Packet completed successfully', { 
      packetId: data.packet_id || data.id,
      completedAt: data.completed_at 
    });
    
  } catch (error) {
    log.error('Error handling packet_completed event', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}

export default router;
