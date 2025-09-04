import { Router } from 'express';
import { authenticateAndVerifyPhone, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MTSA
 *   description: MyTrustSigner Agent integration for digital certificates and OTP
 */

/**
 * @swagger
 * /api/mtsa/cert-info/{userId}:
 *   get:
 *     summary: Get certificate information for a user
 *     tags: [MTSA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (IC number)
 *     responses:
 *       200:
 *         description: Certificate information retrieved successfully
 *       400:
 *         description: User ID is required
 *       500:
 *         description: Failed to get certificate information
 */
router.get('/cert-info/:userId', authenticateAndVerifyPhone, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log('Getting certificate info for user:', { userId });

    // Make request to signing orchestrator
    const response = await fetch(`${process.env.SIGNING_ORCHESTRATOR_URL || 'https://sign.kredit.my'}/api/cert/${userId}`, {
      method: 'GET',
      headers: {
        'X-API-Key': process.env.SIGNING_ORCHESTRATOR_API_KEY || 'test-token',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    console.log('Certificate info response:', { 
      userId, 
      statusCode: data.data?.statusCode,
      success: data.success 
    });

    return res.json(data);
  } catch (error) {
    console.error('Error getting certificate info:', { 
      error: error instanceof Error ? error.message : String(error),
      userId: req.params.userId 
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to get certificate information'
    });
  }
});

/**
 * @swagger
 * /api/mtsa/request-otp:
 *   post:
 *     summary: Request OTP for certificate enrollment or digital signing
 *     tags: [MTSA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - usage
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID (IC number)
 *               usage:
 *                 type: string
 *                 enum: [DS, NU]
 *                 description: DS for digital signing, NU for new enrollment
 *               emailAddress:
 *                 type: string
 *                 description: Email address (required for NU)
 *     responses:
 *       200:
 *         description: OTP request sent successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Failed to request OTP
 */
router.post('/request-otp', authenticateAndVerifyPhone, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, usage, emailAddress } = req.body;

    // Validate required fields
    if (!userId || !usage) {
      return res.status(400).json({
        success: false,
        message: 'User ID and usage type are required'
      });
    }

    if (!['DS', 'NU'].includes(usage)) {
      return res.status(400).json({
        success: false,
        message: 'Usage must be DS (digital signing) or NU (new enrollment)'
      });
    }

    if (usage === 'NU' && !emailAddress) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required for new enrollment (NU)'
      });
    }

    console.log('Requesting OTP for user:', { userId, usage, hasEmail: !!emailAddress });

    // Make request to signing orchestrator
    const response = await fetch(`${process.env.SIGNING_ORCHESTRATOR_URL || 'https://sign.kredit.my'}/api/otp`, {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.SIGNING_ORCHESTRATOR_API_KEY || 'test-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        usage,
        emailAddress,
      }),
    });

    const data = await response.json();
    
    console.log('OTP request response:', { 
      userId, 
      usage,
      statusCode: data.data?.statusCode,
      success: data.success 
    });

    return res.json(data);
  } catch (error) {
    console.error('Error requesting OTP:', { 
      error: error instanceof Error ? error.message : String(error),
      userId: req.body.userId,
      usage: req.body.usage 
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to request OTP'
    });
  }
});

/**
 * @swagger
 * /api/mtsa/verify-otp:
 *   post:
 *     summary: Verify OTP for digital signing
 *     tags: [MTSA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - otp
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID (IC number)
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP code
 *     responses:
 *       200:
 *         description: OTP verification completed
 *       400:
 *         description: Invalid OTP or missing parameters
 *       500:
 *         description: Failed to verify OTP
 */
router.post('/verify-otp', authenticateAndVerifyPhone, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required'
      });
    }

    console.log('Verifying OTP for user:', { userId, otpLength: otp.length });

    // Make request to signing orchestrator
    const response = await fetch(`${process.env.SIGNING_ORCHESTRATOR_URL || 'https://sign.kredit.my'}/api/verify-pin`, {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.SIGNING_ORCHESTRATOR_API_KEY || 'test-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        otp,
      }),
    });

    const data = await response.json();
    
    console.log('OTP verification response:', { 
      userId, 
      statusCode: data.data?.statusCode,
      success: data.success,
      pinVerified: data.data?.pinVerified 
    });

    return res.json(data);
  } catch (error) {
    console.error('Error verifying OTP:', { 
      error: error instanceof Error ? error.message : String(error),
      userId: req.body.userId 
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

export default router;
