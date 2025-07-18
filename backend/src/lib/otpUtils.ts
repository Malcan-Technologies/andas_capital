import { prisma } from "./prisma";
import crypto from "crypto";

interface CreateOTPResult {
	success: boolean;
	otp?: string;
	expiresAt?: Date;
	error?: string;
}

interface ValidateOTPResult {
	success: boolean;
	userId?: string;
	error?: string;
}

export class OTPUtils {
	private static readonly OTP_LENGTH = 6;
	private static readonly OTP_EXPIRY_MINUTES = 5;
	private static readonly MAX_ATTEMPTS = 5;

	/**
	 * Generate a secure 6-digit OTP
	 */
	static generateOTP(): string {
		// Use crypto.randomInt for secure random number generation
		const otp = crypto.randomInt(100000, 999999).toString();
		return otp.padStart(this.OTP_LENGTH, "0");
	}

	/**
	 * Create and store an OTP for a user
	 */
	static async createOTP(
		userId: string,
		phoneNumber: string
	): Promise<CreateOTPResult> {
		try {
			// Generate OTP and expiry time
			const otp = this.generateOTP();
			const expiresAt = new Date(
				Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000
			);

			// Invalidate any existing OTPs for this user
			await prisma.phoneVerification.updateMany({
				where: {
					userId,
					verified: false,
				},
				data: {
					verified: true, // Mark as used so they can't be reused
				},
			});

			// Create new OTP record
			await prisma.phoneVerification.create({
				data: {
					userId,
					phoneNumber,
					otp,
					expiresAt,
					verified: false,
					attempts: 0,
				},
			});

			console.log(`OTP created for user ${userId}: ${otp} (expires at ${expiresAt})`);

			return {
				success: true,
				otp,
				expiresAt,
			};
		} catch (error) {
			console.error("Error creating OTP:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Validate an OTP and mark user as verified if valid
	 */
	static async validateOTP(
		phoneNumber: string,
		otpCode: string
	): Promise<ValidateOTPResult> {
		try {
			// Find the most recent unverified OTP for this phone number
			const otpRecord = await prisma.phoneVerification.findFirst({
				where: {
					phoneNumber,
					verified: false,
					expiresAt: {
						gt: new Date(), // Not expired
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				include: {
					user: true,
				},
			});

			if (!otpRecord) {
				return {
					success: false,
					error: "Invalid or expired OTP. Please request a new one.",
				};
			}

			// Check if max attempts exceeded
			if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
				return {
					success: false,
					error: "Too many invalid attempts. Please request a new OTP.",
				};
			}

			// Increment attempt count
			await prisma.phoneVerification.update({
				where: { id: otpRecord.id },
				data: {
					attempts: otpRecord.attempts + 1,
				},
			});

			// Check if OTP matches
			if (otpRecord.otp !== otpCode) {
				return {
					success: false,
					error: "Invalid OTP. Please try again.",
				};
			}

			// OTP is valid - mark as verified and update user
			await prisma.$transaction(async (tx) => {
				// Mark OTP as verified
				await tx.phoneVerification.update({
					where: { id: otpRecord.id },
					data: { verified: true },
				});

				// Mark user's phone as verified
				await tx.user.update({
					where: { id: otpRecord.userId },
					data: { phoneVerified: true },
				});
			});

			console.log(`Phone verification successful for user ${otpRecord.userId}`);

			return {
				success: true,
				userId: otpRecord.userId,
			};
		} catch (error) {
			console.error("Error validating OTP:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Check if user can request a new OTP (rate limiting)
	 */
	static async canRequestNewOTP(phoneNumber: string): Promise<{
		canRequest: boolean;
		waitTime?: number;
		error?: string;
	}> {
		try {
			// Check for recent OTP requests (within last minute)
			const recentOTP = await prisma.phoneVerification.findFirst({
				where: {
					phoneNumber,
					createdAt: {
						gt: new Date(Date.now() - 60 * 1000), // Last minute
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			if (recentOTP) {
				const waitTime = Math.ceil(
					(60 * 1000 - (Date.now() - recentOTP.createdAt.getTime())) / 1000
				);
				return {
					canRequest: false,
					waitTime: waitTime > 0 ? waitTime : 0,
				};
			}

			return { canRequest: true };
		} catch (error) {
			console.error("Error checking OTP rate limit:", error);
			return {
				canRequest: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Clean up expired OTPs (for maintenance)
	 */
	static async cleanupExpiredOTPs(): Promise<number> {
		try {
			const result = await prisma.phoneVerification.deleteMany({
				where: {
					expiresAt: {
						lt: new Date(),
					},
				},
			});

			console.log(`Cleaned up ${result.count} expired OTPs`);
			return result.count;
		} catch (error) {
			console.error("Error cleaning up expired OTPs:", error);
			return 0;
		}
	}

	/**
	 * Get OTP status for a phone number
	 */
	static async getOTPStatus(phoneNumber: string): Promise<{
		hasActivePendingOTP: boolean;
		attemptsRemaining?: number;
		expiresAt?: Date;
	}> {
		try {
			const otpRecord = await prisma.phoneVerification.findFirst({
				where: {
					phoneNumber,
					verified: false,
					expiresAt: {
						gt: new Date(),
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			if (!otpRecord) {
				return { hasActivePendingOTP: false };
			}

			return {
				hasActivePendingOTP: true,
				attemptsRemaining: Math.max(0, this.MAX_ATTEMPTS - otpRecord.attempts),
				expiresAt: otpRecord.expiresAt,
			};
		} catch (error) {
			console.error("Error getting OTP status:", error);
			return { hasActivePendingOTP: false };
		}
	}
} 