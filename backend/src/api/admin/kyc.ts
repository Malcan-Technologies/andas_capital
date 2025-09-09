import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { prisma } from '../../lib/prisma';
import { ctosService } from '../../lib/ctosService';

const router = Router();

// Admin-only middleware
const adminOnlyMiddleware = async (req: AuthRequest, res: any, next: any) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * @swagger
 * /api/admin/kyc/start-ctos:
 *   post:
 *     summary: Start CTOS eKYC process for admin user
 *     tags: [Admin, KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentName
 *               - documentNumber
 *               - platform
 *             properties:
 *               documentName:
 *                 type: string
 *                 description: Full name as per IC
 *               documentNumber:
 *                 type: string
 *                 description: IC number
 *               platform:
 *                 type: string
 *                 description: Platform (e.g., "web")
 *               adminRequest:
 *                 type: boolean
 *                 description: Flag to indicate admin request
 *               adminUserId:
 *                 type: string
 *                 description: Admin user ID making the request
 *     responses:
 *       200:
 *         description: KYC session started successfully
 *       400:
 *         description: Invalid request parameters
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Failed to start KYC
 */
router.post('/start-ctos', authenticateToken, adminOnlyMiddleware, async (req: AuthRequest, res: Response) => {
  let kycSession: any = null;
  
  try {
    const { documentName, documentNumber, platform = 'web', adminRequest, adminUserId } = req.body;

    if (!documentName || !documentNumber) {
      return res.status(400).json({
        success: false,
        message: 'Document name and number are required'
      });
    }

    console.log('Admin starting KYC for:', { 
      documentName, 
      documentNumber, 
      platform,
      adminUserId: req.user?.userId
    });

    // Check if admin user already has approved KYC session
    const existingApprovedSession = await prisma.kycSession.findFirst({
      where: {
        userId: req.user?.userId,
        status: 'APPROVED'
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('Existing approved session check:', {
      userId: req.user?.userId,
      existingSession: existingApprovedSession?.id,
      status: existingApprovedSession?.status,
      ctosOnboardingId: existingApprovedSession?.ctosOnboardingId
    });

    if (existingApprovedSession) {
      console.log(`Admin user ${req.user?.userId} - Prevented creating new KYC session, already has approved session: ${existingApprovedSession.id}`);
      return res.status(400).json({ 
        success: false,
        message: "CTOS API Error: You already have an approved KYC verification. No further verification is needed.",
        error: "Admin user already has approved KYC session",
        existingSessionId: existingApprovedSession.id
      });
    }

    // Create KYC session for admin user
    kycSession = await prisma.kycSession.create({
      data: {
        userId: req.user?.userId!,
        status: 'IN_PROGRESS',
        metadata: {
          adminRequest: true,
          requestedBy: req.user?.userId
        }
      }
    });

    try {
      // Create CTOS transaction
      console.log('Starting CTOS transaction for admin with params:', {
        ref_id: req.user?.userId,
        document_name: documentName,
        document_number: documentNumber,
        platform,
        callback_mode: 2
      });

      // Build completion URL from BASE_URL environment variable  
      const baseUrl = process.env.BASE_URL || 'https://kredit.my';
      const completionUrl = `${baseUrl}/admin/kyc-complete`;

      const ctosResponse = await ctosService.createTransaction({
        ref_id: req.user?.userId!, // Use admin user UUID as ref_id
        document_name: documentName,
        document_number: documentNumber,
        platform,
        response_url: completionUrl, // Use admin KYC completion page
        backend_url: process.env.CTOS_WEBHOOK_URL || `${process.env.BACKEND_URL || 'http://localhost:4001'}/api/ctos/webhook`,
        callback_mode: 2, // Detailed callback
        response_mode: 0, // No queries - should make webhook work without URL parameters
        document_type: '1' // 1 = NRIC (default for Malaysian users)
      });

      console.log('CTOS Response received for admin:', ctosResponse);

      // Update KYC session with CTOS data
      // Parse expiry date safely
      let ctosExpiredAt: Date | null = null;
      try {
        if (ctosResponse.expired_at) {
          ctosExpiredAt = new Date(ctosResponse.expired_at);
          // Validate the date
          if (isNaN(ctosExpiredAt.getTime())) {
            console.warn('Invalid CTOS expired_at date:', ctosResponse.expired_at);
            ctosExpiredAt = null;
          }
        }
      } catch (parseError) {
        console.error('Error parsing CTOS expired_at:', parseError);
        ctosExpiredAt = null;
      }

      const updatedSession = await prisma.kycSession.update({
        where: { id: kycSession.id },
        data: {
          ctosTransactionId: ctosResponse.transaction_id,
          ctosOnboardingId: ctosResponse.onboarding_id,
          ctosOnboardingUrl: ctosResponse.onboarding_url,
          ctosStatus: 1, // Started
          ctosExpiredAt,
          ctosRawResponse: ctosResponse
        }
      });

      console.log('Admin KYC session updated:', {
        kycId: updatedSession.id,
        ctosTransactionId: updatedSession.ctosTransactionId,
        ctosOnboardingId: updatedSession.ctosOnboardingId,
        hasOnboardingUrl: !!updatedSession.ctosOnboardingUrl
      });

      return res.json({
        success: true,
        kycId: updatedSession.id,
        ctosOnboardingUrl: updatedSession.ctosOnboardingUrl,
        ctosTransactionId: updatedSession.ctosTransactionId,
        status: updatedSession.status,
        message: "KYC session started successfully. Complete the verification using the provided URL."
      });

    } catch (ctosError: any) {
      console.error('CTOS Integration Error for admin:', ctosError);
      
      // Update session status to failed
      if (kycSession) {
        await prisma.kycSession.update({
          where: { id: kycSession.id },
          data: { 
            status: 'REJECTED',
            ctosRawResponse: { error: ctosError.message || String(ctosError) }
          }
        });
      }

      const errorMessage = ctosError.message || String(ctosError);
      return res.status(500).json({
        success: false,
        message: `CTOS Integration Error: ${errorMessage}`
      });
    }
  } catch (error) {
    console.error('Admin KYC start error:', error);
    
    // Clean up failed session
    if (kycSession) {
      try {
        await prisma.kycSession.delete({ where: { id: kycSession.id } });
      } catch (cleanupError) {
        console.error('Failed to cleanup KYC session:', cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to start KYC verification'
    });
  }
});

/**
 * @swagger
 * /api/admin/kyc/{kycId}/status:
 *   get:
 *     summary: Get KYC session status (admin only)
 *     tags: [Admin, KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kycId
 *         required: true
 *         schema:
 *           type: string
 *         description: KYC session ID
 *     responses:
 *       200:
 *         description: KYC status retrieved successfully
 *       404:
 *         description: KYC session not found
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Failed to get KYC status
 */
router.get('/:kycId/status', authenticateToken, adminOnlyMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { kycId } = req.params;

    if (!kycId) {
      return res.status(400).json({
        success: false,
        message: 'KYC ID is required'
      });
    }

    console.log('Admin getting KYC status:', { 
      kycId, 
      adminUserId: req.user?.userId 
    });

    // Get KYC session - only allow admin to access their own sessions
    const kycSession = await prisma.kycSession.findFirst({
      where: { 
        id: kycId,
        userId: req.user?.userId // Ensure admin can only access their own KYC
      },
      include: {
        documents: {
          select: {
            id: true,
            type: true,
            url: true,
            createdAt: true
          }
        }
      }
    });

    if (!kycSession) {
      return res.status(404).json({
        success: false,
        message: 'KYC session not found'
      });
    }

    return res.json({
      success: true,
      id: kycSession.id,
      status: kycSession.status,
      ctosStatus: kycSession.ctosStatus,
      ctosResult: kycSession.ctosResult,
      ctosOnboardingUrl: kycSession.ctosOnboardingUrl,
      ctosTransactionId: kycSession.ctosTransactionId,
      completedAt: kycSession.completedAt,
      documents: kycSession.documents,
      createdAt: kycSession.createdAt,
      updatedAt: kycSession.updatedAt
    });

  } catch (error) {
    console.error('Error getting admin KYC status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get KYC status'
    });
  }
});

/**
 * @swagger
 * /api/admin/kyc/images:
 *   get:
 *     summary: Get KYC images for admin user
 *     tags: [Admin, KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC images retrieved successfully
 *       404:
 *         description: No KYC images found
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Failed to get KYC images
 */
router.get('/images', authenticateToken, adminOnlyMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    console.log('Admin getting KYC images for user:', req.user?.userId);

    // Get the most recent approved KYC session for admin user
    const kycSession = await prisma.kycSession.findFirst({
      where: {
        userId: req.user?.userId,
        status: 'APPROVED'
      },
      include: {
        documents: {
          select: {
            id: true,
            type: true,
            url: true,
            filename: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!kycSession || !kycSession.documents || kycSession.documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No KYC documents found. Please complete KYC verification first.'
      });
    }

    // Organize documents by type
    const front = kycSession.documents.find(doc => doc.type === 'front');
    const back = kycSession.documents.find(doc => doc.type === 'back');
    const selfie = kycSession.documents.find(doc => doc.type === 'selfie');

    console.log('Admin KYC images found:', {
      sessionId: kycSession.id,
      hasFront: !!front,
      hasBack: !!back,
      hasSelfie: !!selfie,
      totalDocuments: kycSession.documents.length
    });

    return res.json({
      success: true,
      sessionId: kycSession.id,
      images: {
        front: front ? {
          id: front.id,
          url: front.url,
          filename: front.filename,
          createdAt: front.createdAt
        } : null,
        back: back ? {
          id: back.id,
          url: back.url,
          filename: back.filename,
          createdAt: back.createdAt
        } : null,
        selfie: selfie ? {
          id: selfie.id,
          url: selfie.url,
          filename: selfie.filename,
          createdAt: selfie.createdAt
        } : null
      }
    });

  } catch (error) {
    console.error('Error getting admin KYC images:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get KYC images'
    });
  }
});

export default router;
