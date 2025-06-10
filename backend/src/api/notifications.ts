import { Router, Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { NotificationService } from "../lib/notifications";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 20;

		const result = await NotificationService.getUserNotifications(
			userId,
			page,
			limit
		);
		return res.json(result);
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return res.status(500).json({ error: "Failed to fetch notifications" });
	}
});

/**
 * @swagger
 * /api/notifications:
 *   patch:
 *     summary: Mark notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificationIds
 *             properties:
 *               notificationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Notifications marked as read
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch(
	"/",
	authenticateToken,
	async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.userId;
			if (!userId) {
				return res.status(401).json({ error: "Unauthorized" });
			}

			const { notificationIds } = req.body;
			if (!Array.isArray(notificationIds)) {
				return res
					.status(400)
					.json({ error: "Invalid notification IDs" });
			}

			await NotificationService.markAsRead(userId, notificationIds);
			return res.json({ success: true });
		} catch (error) {
			console.error("Error marking notifications as read:", error);
			return res
				.status(500)
				.json({ error: "Failed to update notifications" });
		}
	}
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.delete(
	"/:id",
	authenticateToken,
	async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.userId;
			if (!userId) {
				return res.status(401).json({ error: "Unauthorized" });
			}

			const { id } = req.params;

			// Delete the notification
			await prisma.notification.deleteMany({
				where: {
					id,
					userId, // Ensure the notification belongs to the user
				},
			});

			return res.json({ success: true });
		} catch (error) {
			console.error("Error deleting notification:", error);
			return res
				.status(500)
				.json({ error: "Failed to delete notification" });
		}
	}
);

export default router;
