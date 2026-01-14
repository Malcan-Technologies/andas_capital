import { Router } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

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
 * /api/settings:
 *   get:
 *     summary: Get all system settings (admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       key:
 *                         type: string
 *                       category:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       dataType:
 *                         type: string
 *                       value:
 *                         type: string
 *                       options:
 *                         type: object
 *                       isActive:
 *                         type: boolean
 *                       requiresRestart:
 *                         type: boolean
 *                       affectsExistingLoans:
 *                         type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/", authenticateToken, adminOnlyMiddleware, async (_req: AuthRequest, res) => {
	try {
		const settings = await prisma.systemSettings.findMany({
			where: { isActive: true },
			orderBy: [
				{ category: 'asc' },
				{ name: 'asc' }
			]
		});

		// Parse JSON values for response
		const parsedSettings = settings.map(setting => ({
			...setting,
			value: JSON.parse(setting.value)
		}));

		return res.json({
			success: true,
			data: parsedSettings
		});
	} catch (error) {
		console.error("Error fetching system settings:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch system settings",
			error: error.message
		});
	}
});

/**
 * @swagger
 * /api/settings/categories:
 *   get:
 *     summary: Get settings grouped by category (admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 */
router.get("/categories", authenticateToken, adminOnlyMiddleware, async (_req: AuthRequest, res) => {
	try {
		const settings = await prisma.systemSettings.findMany({
			where: { isActive: true },
			orderBy: [
				{ category: 'asc' },
				{ name: 'asc' }
			]
		});

		// Group settings by category
		const groupedSettings = settings.reduce((acc, setting) => {
			if (!acc[setting.category]) {
				acc[setting.category] = [];
			}
			
			acc[setting.category].push({
				...setting,
				value: JSON.parse(setting.value)
			});
			
			return acc;
		}, {} as Record<string, any[]>);

		return res.json({
			success: true,
			data: groupedSettings
		});
	} catch (error) {
		console.error("Error fetching settings categories:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch settings categories",
			error: error.message
		});
	}
});

/**
 * @swagger
 * /api/settings/{key}:
 *   get:
 *     summary: Get a specific setting by key
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Setting retrieved successfully
 *       404:
 *         description: Setting not found
 */
router.get("/:key", authenticateToken, async (req: AuthRequest, res) => {
	try {
		const { key } = req.params;
		
		const setting = await prisma.systemSettings.findUnique({
			where: { 
				key,
				isActive: true 
			}
		});

		if (!setting) {
			return res.status(404).json({
				success: false,
				message: "Setting not found"
			});
		}

		return res.json({
			success: true,
			data: {
				...setting,
				value: JSON.parse(setting.value)
			}
		});
	} catch (error) {
		console.error("Error fetching setting:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch setting",
			error: error.message
		});
	}
});

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update multiple system settings (admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               settings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     value:
 *                       type: string
 *             example:
 *               settings:
 *                 - key: "LOAN_CALCULATION_METHOD"
 *                   value: "RULE_OF_78"
 *                 - key: "PAYMENT_SCHEDULE_TYPE"
 *                   value: "FIRST_OF_MONTH"
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put("/", authenticateToken, adminOnlyMiddleware, async (req: AuthRequest, res) => {
	try {
		const { settings } = req.body;
		const adminUserId = req.user?.userId;

		if (!settings || !Array.isArray(settings)) {
			return res.status(400).json({
				success: false,
				message: "Settings array is required"
			});
		}

		const updates = [];
		const now = new Date();

		for (const settingUpdate of settings) {
			const { key, value } = settingUpdate;

			if (!key || value === undefined) {
				return res.status(400).json({
					success: false,
					message: "Each setting must have a key and value"
				});
			}

			// Verify setting exists
			const existingSetting = await prisma.systemSettings.findUnique({
				where: { key }
			});

			if (!existingSetting) {
				return res.status(400).json({
					success: false,
					message: `Setting with key '${key}' not found`
				});
			}

			// Validate value based on data type
			let validatedValue;
			try {
				switch (existingSetting.dataType) {
					case "ENUM":
						if (typeof value !== "string") {
							throw new Error("Enum value must be a string");
						}
						const options = existingSetting.options as any;
						if (options && !options[value]) {
							throw new Error(`Invalid enum value: ${value}`);
						}
						validatedValue = JSON.stringify(value);
						break;
					
					case "BOOLEAN":
						if (typeof value !== "boolean") {
							throw new Error("Boolean value required");
						}
						validatedValue = JSON.stringify(value);
						break;
					
					case "NUMBER":
						if (typeof value !== "number") {
							throw new Error("Number value required");
						}
						const numOptions = existingSetting.options as any;
						if (numOptions) {
							if (numOptions.min !== undefined && value < numOptions.min) {
								throw new Error(`Value must be at least ${numOptions.min}`);
							}
							if (numOptions.max !== undefined && value > numOptions.max) {
								throw new Error(`Value must be at most ${numOptions.max}`);
							}
						}
						validatedValue = JSON.stringify(value);
						break;
					
					case "STRING":
						if (typeof value !== "string") {
							throw new Error("String value required");
						}
						validatedValue = JSON.stringify(value);
						break;
					
					default:
						validatedValue = JSON.stringify(value);
				}
			} catch (validationError) {
				return res.status(400).json({
					success: false,
					message: `Invalid value for setting '${key}': ${validationError.message}`
				});
			}

			updates.push(
				prisma.systemSettings.update({
					where: { key },
					data: {
						value: validatedValue,
						lastChangedBy: adminUserId,
						lastChangedAt: now
					}
				})
			);
		}

		// Execute all updates in a transaction
		const results = await prisma.$transaction(updates);

		return res.json({
			success: true,
			message: `${results.length} settings updated successfully`,
			data: results.map(result => ({
				...result,
				value: JSON.parse(result.value)
			}))
		});

	} catch (error) {
		console.error("Error updating settings:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to update settings",
			error: error.message
		});
	}
});

/**
 * @swagger
 * /api/settings/{key}:
 *   put:
 *     summary: Update a specific setting (admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *             example:
 *               value: "RULE_OF_78"
 *     responses:
 *       200:
 *         description: Setting updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Setting not found
 */
router.put("/:key", authenticateToken, adminOnlyMiddleware, async (req: AuthRequest, res) => {
	try {
		const { key } = req.params;
		const { value } = req.body;
		const adminUserId = req.user?.userId;

		if (value === undefined) {
			return res.status(400).json({
				success: false,
				message: "Value is required"
			});
		}

		// Verify setting exists
		const existingSetting = await prisma.systemSettings.findUnique({
			where: { key }
		});

		if (!existingSetting) {
			return res.status(404).json({
				success: false,
				message: "Setting not found"
			});
		}

		// Simple validation - just stringify the value
		const validatedValue = JSON.stringify(value);
		const now = new Date();

		const updatedSetting = await prisma.systemSettings.update({
			where: { key },
			data: {
				value: validatedValue,
				lastChangedBy: adminUserId,
				lastChangedAt: now
			}
		});

		return res.json({
			success: true,
			message: "Setting updated successfully",
			data: {
				...updatedSetting,
				value: JSON.parse(updatedSetting.value)
			}
		});

	} catch (error) {
		console.error("Error updating setting:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to update setting",
			error: error.message
		});
	}
});

export default router;