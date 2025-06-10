import {
	PrismaClient,
	NotificationType,
	NotificationPriority,
	Prisma,
} from "@prisma/client";
import { logger } from "./logger";

const prisma = new PrismaClient();

interface CreateSystemNotificationParams {
	userId: string;
	templateCode: string;
	metadata?: Record<string, any>;
	priority?: NotificationPriority;
	link?: string;
}

interface CreateMarketingNotificationParams {
	title: string;
	message: string;
	groupId?: string;
	filters?: Record<string, any>;
	priority?: NotificationPriority;
	expiresAt?: Date;
	link?: string;
}

export class NotificationService {
	// Create a system notification for a specific user
	static async createSystemNotification({
		userId,
		templateCode,
		metadata,
		priority = NotificationPriority.LOW,
		link,
	}: CreateSystemNotificationParams) {
		try {
			const template = await prisma.notificationTemplate.findUnique({
				where: { code: templateCode },
			});

			if (!template) {
				throw new Error(`Template with code ${templateCode} not found`);
			}

			return await prisma.notification.create({
				data: {
					userId,
					templateId: template.id,
					type: NotificationType.SYSTEM,
					title: template.title,
					message: template.message,
					priority,
					metadata: metadata || {},
					link,
				},
			});
		} catch (error) {
			logger.error("Error creating system notification:", error);
			throw error;
		}
	}

	// Create marketing notifications for multiple users based on filters
	static async createMarketingNotification({
		title,
		message,
		groupId,
		filters,
		priority = NotificationPriority.LOW,
		expiresAt,
		link,
	}: CreateMarketingNotificationParams) {
		try {
			let userFilters: Prisma.UserWhereInput = {};

			if (groupId) {
				const group = await prisma.notificationGroup.findUnique({
					where: { id: groupId },
				});
				if (group) {
					userFilters = group.filters as Prisma.UserWhereInput;
				}
			} else if (filters) {
				userFilters = filters as Prisma.UserWhereInput;
			}

			// Get all users matching the filters
			const users = await prisma.user.findMany({
				where: userFilters,
				select: { id: true },
			});

			// Create notifications in bulk
			const notifications = users.map((user) => ({
				userId: user.id,
				type: NotificationType.MARKETING,
				title,
				message,
				priority,
				expiresAt,
				link,
			}));

			await prisma.notification.createMany({
				data: notifications,
			});

			return { count: notifications.length };
		} catch (error) {
			logger.error("Error creating marketing notifications:", error);
			throw error;
		}
	}

	// Get notifications for a user
	static async getUserNotifications(userId: string, page = 1, limit = 20) {
		try {
			const [notifications, total] = await Promise.all([
				prisma.notification.findMany({
					where: {
						userId,
						OR: [
							{ expiresAt: null },
							{ expiresAt: { gt: new Date() } },
						],
					},
					select: {
						id: true,
						userId: true,
						templateId: true,
						type: true,
						priority: true,
						title: true,
						message: true,
						link: true,
						metadata: true,
						isRead: true,
						expiresAt: true,
						createdAt: true,
						updatedAt: true,
					},
					orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
					skip: (page - 1) * limit,
					take: limit,
				}),
				prisma.notification.count({
					where: { userId },
				}),
			]);

			return {
				notifications,
				pagination: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
				},
			};
		} catch (error) {
			logger.error("Error fetching user notifications:", error);
			throw error;
		}
	}

	// Mark notifications as read
	static async markAsRead(userId: string, notificationIds: string[]) {
		try {
			await prisma.notification.updateMany({
				where: {
					userId,
					id: { in: notificationIds },
				},
				data: { isRead: true },
			});
		} catch (error) {
			logger.error("Error marking notifications as read:", error);
			throw error;
		}
	}

	// Create notification templates
	static async createTemplate(
		code: string,
		title: string,
		message: string,
		type: NotificationType
	) {
		try {
			return await prisma.notificationTemplate.create({
				data: { code, title, message, type },
			});
		} catch (error) {
			logger.error("Error creating notification template:", error);
			throw error;
		}
	}
}
