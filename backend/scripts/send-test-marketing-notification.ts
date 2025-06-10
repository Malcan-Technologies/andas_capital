import {
	PrismaClient,
	NotificationType,
	NotificationPriority,
} from "@prisma/client";

const prisma = new PrismaClient();

async function sendMarketingNotification() {
	try {
		// Get all users
		const users = await prisma.user.findMany({
			select: { id: true },
		});

		if (users.length === 0) {
			console.log("No users found in the database.");
			return;
		}

		// Create notifications for all users
		const notifications = users.map((user) => ({
			userId: user.id,
			type: NotificationType.MARKETING,
			title: "🎉 Special Launch Discount!",
			message:
				"For a limited time, get 25% off on loan processing fees. Apply now to take advantage of this special offer!",
			priority: NotificationPriority.HIGH,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
		}));

		const result = await prisma.notification.createMany({
			data: notifications,
		});

		console.log(
			`Successfully sent marketing notification to ${result.count} users!`
		);
	} catch (error) {
		console.error("Error sending marketing notification:", error);
	} finally {
		await prisma.$disconnect();
	}
}

// Execute the function
sendMarketingNotification();
