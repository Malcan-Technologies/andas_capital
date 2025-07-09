const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Malaysia timezone utility function
function getMalaysiaStartOfDay(date) {
    const targetDate = date || new Date();
    
    // Convert to Malaysia timezone (UTC+8)
    const malaysiaTime = new Date(targetDate.getTime() + (8 * 60 * 60 * 1000));
    
    // Get start of day in Malaysia timezone
    const malaysiaStartOfDay = new Date(malaysiaTime);
    malaysiaStartOfDay.setUTCHours(0, 0, 0, 0);
    
    // Convert back to UTC for database storage
    return new Date(malaysiaStartOfDay.getTime() - (8 * 60 * 60 * 1000));
}

// Calculate days overdue using Malaysia timezone
function calculateDaysOverdueMalaysia(dueDate) {
    const today = getMalaysiaStartOfDay();
    const due = getMalaysiaStartOfDay(dueDate);
    const diffMs = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

async function processOverduePayments() {
	try {
		console.log("🕐 Starting daily overdue payment processing...");
		const startTime = new Date();

		// Set today to start of day for accurate comparison (Malaysia timezone)
		const today = getMalaysiaStartOfDay();

		console.log(`📅 Processing date: ${today.toISOString().split("T")[0]}`);

		// Find all pending payments that are now overdue
		const overduePayments = await prisma.loanRepayment.findMany({
			where: {
				status: "PENDING",
				dueDate: {
					lt: today,
				},
			},
			include: {
				loan: {
					include: {
						user: {
							select: {
								id: true,
								fullName: true,
								email: true,
								phoneNumber: true,
							},
						},
					},
				},
			},
		});

		console.log(
			`📋 Found ${overduePayments.length} overdue payments to process`
		);

		if (overduePayments.length === 0) {
			console.log("✅ No overdue payments found. Processing complete.");
			return;
		}

		// Update overdue payments
		const updateResult = await prisma.loanRepayment.updateMany({
			where: {
				status: "PENDING",
				dueDate: {
					lt: today,
				},
			},
			data: {
				status: "OVERDUE",
			},
		});

		console.log(
			`✅ Updated ${updateResult.count} payments to OVERDUE status`
		);

		// Find loans that now have overdue payments and update their status
		const loansWithOverduePayments = await prisma.loan.findMany({
			where: {
				status: "ACTIVE",
				repayments: {
					some: {
						status: "OVERDUE",
					},
				},
			},
		});

		console.log(
			`🏦 Found ${loansWithOverduePayments.length} loans to mark as overdue`
		);

		// Update loan statuses
		for (const loan of loansWithOverduePayments) {
			await prisma.loan.update({
				where: { id: loan.id },
				data: { status: "OVERDUE" },
			});

			console.log(`📝 Updated loan ${loan.id} status to OVERDUE`);
		}

		// Create notifications for overdue payments
		const notifications = [];
		for (const payment of overduePayments) {
			const daysOverdue = calculateDaysOverdueMalaysia(new Date(payment.dueDate));

			notifications.push({
				userId: payment.loan.userId,
				title: "Payment Overdue",
				message: `Your loan payment of MYR ${payment.amount.toFixed(
					0
				)} is now ${daysOverdue} day${
					daysOverdue > 1 ? "s" : ""
				} overdue. Please make your payment as soon as possible.`,
				type: "SYSTEM",
				priority: "HIGH",
				metadata: {
					loanId: payment.loanId,
					repaymentId: payment.id,
					daysOverdue: daysOverdue,
					amount: payment.amount,
					dueDate: payment.dueDate,
					processedAt: new Date().toISOString(),
				},
			});
		}

		if (notifications.length > 0) {
			await prisma.notification.createMany({
				data: notifications,
			});
			console.log(
				`📧 Created ${notifications.length} overdue notifications`
			);
		}

		// Generate summary report
		const summary = {
			processedAt: new Date().toISOString(),
			overduePaymentsFound: overduePayments.length,
			paymentsUpdated: updateResult.count,
			loansMarkedOverdue: loansWithOverduePayments.length,
			notificationsCreated: notifications.length,
			processingTimeMs: new Date().getTime() - startTime.getTime(),
		};

		console.log("\n📊 Processing Summary:");
		console.log(
			`   • Overdue payments found: ${summary.overduePaymentsFound}`
		);
		console.log(`   • Payments updated: ${summary.paymentsUpdated}`);
		console.log(`   • Loans marked overdue: ${summary.loansMarkedOverdue}`);
		console.log(
			`   • Notifications created: ${summary.notificationsCreated}`
		);
		console.log(`   • Processing time: ${summary.processingTimeMs}ms`);

		// Log the summary to a file or database for monitoring
		console.log("\n✅ Daily overdue processing completed successfully!");

		return summary;
	} catch (error) {
		console.error("❌ Error processing overdue payments:", error);

		// Create an alert notification for administrators
		try {
			// Find the first admin user to send the alert to
			const adminUser = await prisma.user.findFirst({
				where: { role: "ADMIN" },
				select: { id: true },
			});

			if (adminUser) {
				await prisma.notification.create({
					data: {
						userId: adminUser.id,
						title: "System Alert: Overdue Processing Failed",
						message: `Daily overdue payment processing failed: ${error.message}`,
						type: "SYSTEM",
						priority: "HIGH",
						metadata: {
							error: error.message,
							stack: error.stack,
							timestamp: new Date().toISOString(),
						},
					},
				});
				console.log("📧 Created system alert notification for admin");
			} else {
				console.warn(
					"⚠️ No admin users found - cannot create system alert notification"
				);
				console.error(
					"💥 CRITICAL: Overdue processing failed and no admin to notify:",
					error.message
				);
			}
		} catch (notificationError) {
			console.error(
				"❌ Failed to create error notification:",
				notificationError
			);
		}

		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run the function if this script is executed directly
if (require.main === module) {
	processOverduePayments()
		.then((summary) => {
			console.log("🎯 Script execution completed");
			process.exit(0);
		})
		.catch((error) => {
			console.error("💥 Script execution failed:", error);
			process.exit(1);
		});
}

module.exports = { processOverduePayments };
