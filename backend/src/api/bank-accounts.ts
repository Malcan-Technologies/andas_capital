import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

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

// GET /api/settings/bank-accounts - Get all bank accounts
router.get("/", authenticateToken, adminOnlyMiddleware, async (_req: AuthRequest, res: Response) => {
	try {
		const bankAccounts = await prisma.bankAccount.findMany({
			orderBy: [
				{ isDefault: 'desc' }, // Default account first
				{ isActive: 'desc' },   // Active accounts first
				{ createdAt: 'desc' }   // Newest first
			]
		});

		res.status(200).json({
			success: true,
			data: bankAccounts,
			message: "Bank accounts retrieved successfully"
		});
	} catch (error) {
		console.error("Error fetching bank accounts:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch bank accounts"
		});
	}
});

// GET /api/bank-accounts/default - Get default/active bank account
router.get("/default", async (_req: AuthRequest, res: Response) => {
	try {
		// First try to find the default account
		let bankAccount = await prisma.bankAccount.findFirst({
			where: { 
				isDefault: true,
				isActive: true 
			}
		});

		let accountSource = "default";

		// If no default account, get the newest active account
		if (!bankAccount) {
			bankAccount = await prisma.bankAccount.findFirst({
				where: { isActive: true },
				orderBy: { createdAt: 'desc' }
			});
			accountSource = "fallback-newest";
		}

		if (!bankAccount) {
			console.log("🏦 Bank Account Request: No accounts found");
			return res.status(200).json({
				success: true,
				data: null,
				message: "No bank accounts configured yet"
			});
		}

		// Log which account is being used
		console.log(`🏦 Bank Account Request: Using ${accountSource} account - ${bankAccount.bankName} (${bankAccount.accountNumber}) [ID: ${bankAccount.id}]`);

		return res.status(200).json({
			success: true,
			data: bankAccount,
			message: "Default bank account retrieved successfully"
		});
	} catch (error) {
		console.error("❌ Error fetching default bank account:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch default bank account"
		});
	}
});

// POST /api/settings/bank-accounts - Create new bank account
router.post("/", authenticateToken, adminOnlyMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		const { bankName, accountName, accountNumber, isActive, isDefault } = req.body;

		// Validate required fields
		if (!bankName || !accountName || !accountNumber) {
			return res.status(400).json({
				success: false,
				message: "Bank name, account name, and account number are required"
			});
		}

		// If this is being set as default, unset other defaults
		if (isDefault) {
			const existingDefaultCount = await prisma.bankAccount.count({
				where: { isDefault: true }
			});
			
			if (existingDefaultCount > 0) {
				console.log(`🏦 Bank Account Management: Unsetting ${existingDefaultCount} existing default accounts`);
				await prisma.bankAccount.updateMany({
					where: { isDefault: true },
					data: { isDefault: false }
				});
			}
		}

		const bankAccount = await prisma.bankAccount.create({
			data: {
				bankName,
				accountName,
				accountNumber,
				isActive: isActive !== undefined ? isActive : true,
				isDefault: isDefault || false,
				createdBy: req.user?.userId
			}
		});

		console.log(`🏦 Bank Account Management: Created new account - ${bankAccount.bankName} (${bankAccount.accountNumber}) [ID: ${bankAccount.id}] [Default: ${bankAccount.isDefault}]`);

		return res.status(201).json({
			success: true,
			data: bankAccount,
			message: "Bank account created successfully"
		});
	} catch (error) {
		console.error("Error creating bank account:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to create bank account"
		});
	}
});

// PUT /api/settings/bank-accounts/:id - Update bank account
router.put("/:id", authenticateToken, adminOnlyMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		const { id } = req.params;
		const { bankName, accountName, accountNumber, isActive, isDefault } = req.body;

		// Check if bank account exists
		const existingAccount = await prisma.bankAccount.findUnique({
			where: { id }
		});

		if (!existingAccount) {
			return res.status(404).json({
				success: false,
				message: "Bank account not found"
			});
		}

		// If this is being set as default, unset other defaults
		if (isDefault && !existingAccount.isDefault) {
			const existingDefaultCount = await prisma.bankAccount.count({
				where: { 
					isDefault: true,
					id: { not: id }
				}
			});
			
			if (existingDefaultCount > 0) {
				console.log(`🏦 Bank Account Management: Unsetting ${existingDefaultCount} existing default accounts for update`);
				await prisma.bankAccount.updateMany({
					where: { 
						isDefault: true,
						id: { not: id }
					},
					data: { isDefault: false }
				});
			}
		}

		const bankAccount = await prisma.bankAccount.update({
			where: { id },
			data: {
				...(bankName && { bankName }),
				...(accountName && { accountName }),
				...(accountNumber && { accountNumber }),
				...(isActive !== undefined && { isActive }),
				...(isDefault !== undefined && { isDefault })
			}
		});

		console.log(`🏦 Bank Account Management: Updated account - ${bankAccount.bankName} (${bankAccount.accountNumber}) [ID: ${bankAccount.id}] [Default: ${bankAccount.isDefault}] [Active: ${bankAccount.isActive}]`);

		return res.status(200).json({
			success: true,
			data: bankAccount,
			message: "Bank account updated successfully"
		});
	} catch (error) {
		console.error("Error updating bank account:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to update bank account"
		});
	}
});

// DELETE /api/settings/bank-accounts/:id - Delete bank account
router.delete("/:id", authenticateToken, adminOnlyMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		const { id } = req.params;

		// Check if bank account exists
		const existingAccount = await prisma.bankAccount.findUnique({
			where: { id }
		});

		if (!existingAccount) {
			return res.status(404).json({
				success: false,
				message: "Bank account not found"
			});
		}

		// Don't allow deleting the last active account
		const activeAccountsCount = await prisma.bankAccount.count({
			where: { isActive: true }
		});

		if (existingAccount.isActive && activeAccountsCount <= 1) {
			return res.status(400).json({
				success: false,
				message: "Cannot delete the last active bank account"
			});
		}

		console.log(`🏦 Bank Account Management: Deleting account - ${existingAccount.bankName} (${existingAccount.accountNumber}) [ID: ${existingAccount.id}] [Default: ${existingAccount.isDefault}]`);

		await prisma.bankAccount.delete({
			where: { id }
		});

		// If we deleted the default account, set another active account as default
		if (existingAccount.isDefault) {
			const nextAccount = await prisma.bankAccount.findFirst({
				where: { isActive: true },
				orderBy: { createdAt: 'desc' }
			});

			if (nextAccount) {
				await prisma.bankAccount.update({
					where: { id: nextAccount.id },
					data: { isDefault: true }
				});
				console.log(`🏦 Bank Account Management: Auto-promoted account to default - ${nextAccount.bankName} (${nextAccount.accountNumber}) [ID: ${nextAccount.id}]`);
			} else {
				console.log(`🏦 Bank Account Management: No remaining active accounts to set as default`);
			}
		}

		return res.status(200).json({
			success: true,
			message: "Bank account deleted successfully"
		});
	} catch (error) {
		console.error("Error deleting bank account:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to delete bank account"
		});
	}
});

// POST /api/settings/bank-accounts/:id/set-default - Set as default account
router.post("/:id/set-default", authenticateToken, adminOnlyMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		const { id } = req.params;

		// Check if bank account exists and is active
		const existingAccount = await prisma.bankAccount.findUnique({
			where: { id }
		});

		if (!existingAccount) {
			return res.status(404).json({
				success: false,
				message: "Bank account not found"
			});
		}

		if (!existingAccount.isActive) {
			return res.status(400).json({
				success: false,
				message: "Cannot set inactive account as default"
			});
		}

		// Unset all other defaults
		const existingDefaultCount = await prisma.bankAccount.count({
			where: { 
				isDefault: true,
				id: { not: id }
			}
		});
		
		if (existingDefaultCount > 0) {
			console.log(`🏦 Bank Account Management: Unsetting ${existingDefaultCount} existing default accounts for manual default change`);
			await prisma.bankAccount.updateMany({
				where: { 
					isDefault: true,
					id: { not: id }
				},
				data: { isDefault: false }
			});
		}

		// Set this account as default
		const bankAccount = await prisma.bankAccount.update({
			where: { id },
			data: { isDefault: true }
		});

		console.log(`🏦 Bank Account Management: Manually set as default - ${bankAccount.bankName} (${bankAccount.accountNumber}) [ID: ${bankAccount.id}]`);

		return res.status(200).json({
			success: true,
			data: bankAccount,
			message: "Default bank account updated successfully"
		});
	} catch (error) {
		console.error("Error setting default bank account:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to set default bank account"
		});
	}
});

export default router;