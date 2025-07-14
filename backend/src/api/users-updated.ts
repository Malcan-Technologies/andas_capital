import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/auth";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { validatePhoneNumber, normalizePhoneNumber } from "../lib/phoneUtils";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for managing logged-in user's data
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 fullName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 dateOfBirth:
 *                   type: string
 *                   format: date-time
 *                 address1:
 *                   type: string
 *                 address2:
 *                   type: string
 *                 city:
 *                   type: string
 *                 state:
 *                   type: string
 *                 postalCode:
 *                   type: string
 *                 employmentStatus:
 *                   type: string
 *                 employerName:
 *                   type: string
 *                 monthlyIncome:
 *                   type: string
 *                 bankName:
 *                   type: string
 *                 accountNumber:
 *                   type: string
 *                 icNumber:
 *                   type: string
 *                 icType:
 *                   type: string
 *                 emergencyContactName:
 *                   type: string
 *                 emergencyContactPhone:
 *                   type: string
 *                 emergencyContactRelationship:
 *                   type: string
 *                 isOnboardingComplete:
 *                   type: boolean
 *                 onboardingStep:
 *                   type: number
 *                 kycStatus:
 *                   type: string
 *                 lastLoginAt:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 *       404:
 *         description: User not found
 *       500:
 * 
 */
router.get(
	"/me",
	authenticateToken,
	async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.userId;
			if (!userId) {
				return res.status(401).json({ message: "Unauthorized" });
			}

			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					phoneNumber: true,
					fullName: true,
					email: true,
					dateOfBirth: true,
					address1: true,
					address2: true,
					city: true,
					state: true,
					zipCode: true,
					employmentStatus: true,
					employerName: true,
					monthlyIncome: true,
					bankName: true,
					accountNumber: true,
					isOnboardingComplete: true,
					onboardingStep: true,
					kycStatus: true,
					lastLoginAt: true,
					createdAt: true,
					updatedAt: true,
					role: true,
					// IC/Passport Information
					icNumber: true,
					icType: true,
					// Emergency Contact Information
					emergencyContactName: true,
					emergencyContactPhone: true,
					emergencyContactRelationship: true,
				},
			});

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			return res.json(user);
		} catch (error) {
			console.error("Error fetching user data:", error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}
);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update current user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               address1:
 *                 type: string
 *               address2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               employmentStatus:
 *                 type: string
 *               employerName:
 *                 type: string
 *               monthlyIncome:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               icNumber:
 *                 type: string
 *               icType:
 *                 type: string
 *               emergencyContactName:
 *                 type: string
 *               emergencyContactPhone:
 *                 type: string
 *               emergencyContactRelationship:
 *                 type: string
 *     responses:
 *       200:
 *         description: User information updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(
	"/me",
	authenticateToken,
	async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.userId;
			if (!userId) {
				return res.status(401).json({ message: "Unauthorized" });
			}

			// Convert date string to Date object if present
			let updateData = { ...req.body };
			if (updateData.dateOfBirth) {
				updateData.dateOfBirth = new Date(updateData.dateOfBirth);
			}

			// Validate and normalize phone number if provided
			if (updateData.phoneNumber) {
				console.log("Validating phone number:", updateData.phoneNumber);
				
				const phoneValidation = validatePhoneNumber(updateData.phoneNumber, {
					requireMobile: false, // Allow both mobile and landline for profile update
					allowLandline: true
				});

				if (!phoneValidation.isValid) {
					console.log("Phone validation failed:", phoneValidation.error);
					return res.status(400).json({ 
						message: phoneValidation.error || "Invalid phone number format" 
					});
				}

				// Normalize phone number to E.164 format (with + prefix) for database storage
				const normalizedPhone = normalizePhoneNumber(updateData.phoneNumber);
				console.log("Normalized phone number:", normalizedPhone);
				updateData.phoneNumber = normalizedPhone;

				// Check if another user already has this phone number
				const existingUser = await prisma.user.findFirst({
					where: { 
						phoneNumber: normalizedPhone,
						NOT: { id: userId } // Exclude current user
					}
				});

				console.log("Existing user check result:", existingUser ? "Found duplicate" : "No duplicate found");

				if (existingUser) {
					console.log("Returning duplicate phone number error");
					return res.status(400).json({ 
						message: "This phone number is already registered to another account" 
					});
				}
			}

			// Validate IC number if provided
			if (updateData.icNumber) {
				// Basic validation - you can enhance this with the IC utility functions
				const icNumber = updateData.icNumber.trim();
				if (icNumber.length < 6) {
					return res.status(400).json({ 
						message: "IC/Passport number is too short" 
					});
				}
			}

			// Validate emergency contact - if any field is provided, all must be provided
			const emergencyFields = [
				updateData.emergencyContactName,
				updateData.emergencyContactPhone,
				updateData.emergencyContactRelationship
			];
			const providedEmergencyFields = emergencyFields.filter(field => field && field.trim());
			
			if (providedEmergencyFields.length > 0 && providedEmergencyFields.length < 3) {
				return res.status(400).json({ 
					message: "All emergency contact fields (name, phone, relationship) are required" 
				});
			}

			if (updateData.kycStatus !== undefined) {
				updateData.kycStatus = Boolean(updateData.kycStatus);
			}

			const updatedUser = await prisma.user.update({
				where: { id: userId },
				data: updateData,
				select: {
					id: true,
					phoneNumber: true,
					fullName: true,
					email: true,
					dateOfBirth: true,
					address1: true,
					address2: true,
					city: true,
					state: true,
					zipCode: true,
					employmentStatus: true,
					employerName: true,
					monthlyIncome: true,
					bankName: true,
					accountNumber: true,
					isOnboardingComplete: true,
					onboardingStep: true,
					kycStatus: true,
					lastLoginAt: true,
					createdAt: true,
					updatedAt: true,
					role: true,
					// IC/Passport Information
					icNumber: true,
					icType: true,
					// Emergency Contact Information
					emergencyContactName: true,
					emergencyContactPhone: true,
					emergencyContactRelationship: true,
				},
			});

			return res.json(updatedUser);
		} catch (error) {
			console.error("Error updating user data:", error);
			console.error("Error details:", {
				message: error instanceof Error ? error.message : "Unknown error",
				stack: error instanceof Error ? error.stack : "No stack trace",
				code: (error as any)?.code,
				meta: (error as any)?.meta
			});
			return res.status(500).json({ message: "Failed to update user data" });
		}
	}
);

/**
 * @swagger
 * /api/users/me/password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password for verification
 *               newPassword:
 *                 type: string
 *                 description: New password (minimum 8 characters)
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid request or password requirements not met
 *       401:
 *         description: Unauthorized or current password is incorrect
 *       500:
 *         description: Server error
 */
router.put(
	"/me/password",
	authenticateToken,
	async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.userId;
			if (!userId) {
				return res.status(401).json({ message: "Unauthorized" });
			}

			const { currentPassword, newPassword } = req.body;

			// Validate input
			if (!currentPassword || !newPassword) {
				return res.status(400).json({ 
					message: "Current password and new password are required" 
				});
			}

			if (newPassword.length < 8) {
				return res.status(400).json({ 
					message: "New password must be at least 8 characters long" 
				});
			}

			// Get user with password
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					password: true,
				},
			});

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			// Verify current password
			const bcrypt = require('bcryptjs');
			const isValidPassword = await bcrypt.compare(currentPassword, user.password);

			if (!isValidPassword) {
				return res.status(401).json({ message: "Current password is incorrect" });
			}

			// Hash new password
			const saltRounds = 10;
			const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

			// Update password
			await prisma.user.update({
				where: { id: userId },
				data: {
					password: hashedNewPassword,
				},
			});

			return res.json({ message: "Password changed successfully" });
		} catch (error) {
			console.error("Error changing password:", error);
			return res.status(500).json({ message: "Failed to change password" });
		}
	}
);

export default router; 