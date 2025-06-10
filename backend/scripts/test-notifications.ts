import {
	PrismaClient,
	NotificationType,
	NotificationPriority,
} from "@prisma/client";
import { NotificationService } from "../src/lib/notifications";

const prisma = new PrismaClient();

async function createTestNotifications() {
	try {
		// First, get a test user
		const testUser = await prisma.user.findFirst();

		if (!testUser) {
			console.error("No test user found");
			return;
		}

		console.log("Found test user:", testUser.id);

		// Get or create a notification template
		let template = await prisma.notificationTemplate.findUnique({
			where: { code: "TEST_NOTIFICATION" },
		});

		if (!template) {
			template = await prisma.notificationTemplate.create({
				data: {
					code: "TEST_NOTIFICATION",
					title: "Test Notification",
					message: "This is a test notification with a link",
					type: NotificationType.SYSTEM,
				},
			});
			console.log("Created new template");
		} else {
			console.log("Using existing template");
		}

		// Create different types of notifications with links
		await Promise.all([
			// System notification with internal link
			NotificationService.createSystemNotification({
				userId: testUser.id,
				templateCode: template.code,
				priority: NotificationPriority.HIGH,
				link: "/dashboard/profile",
			}).then(() =>
				console.log("Created system notification with profile link")
			),

			// Marketing notification with external link
			NotificationService.createMarketingNotification({
				title: "Special Offer!",
				message: "Check out our new loan products with special rates",
				priority: NotificationPriority.MEDIUM,
				link: "https://example.com/special-offer",
				filters: { id: testUser.id },
			}).then(() =>
				console.log("Created marketing notification with external link")
			),

			// System notification with internal link to loan application
			NotificationService.createSystemNotification({
				userId: testUser.id,
				templateCode: template.code,
				priority: NotificationPriority.LOW,
				metadata: { applicationId: "test-app" },
				link: "/dashboard/applications/test-app",
			}).then(() =>
				console.log("Created system notification with application link")
			),
		]);

		// Verify notifications were created
		const notifications = await prisma.notification.findMany({
			where: { userId: testUser.id },
			orderBy: { createdAt: "desc" },
			take: 3,
			include: { template: true },
		});

		console.log("\nCreated Notifications:");
		console.log(JSON.stringify(notifications, null, 2));

		console.log("All test notifications created successfully!");
	} catch (error) {
		console.error("Error creating test notifications:", error);
	} finally {
		await prisma.$disconnect();
	}
}

createTestNotifications()
	.then(() => console.log("Script completed"))
	.catch(console.error);
