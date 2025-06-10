const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addWalletBalance() {
	try {
		// Find the admin user
		const adminUser = await prisma.user.findFirst({
			where: {
				phoneNumber: "60123456789",
			},
		});

		if (!adminUser) {
			console.log("Admin user not found");
			return;
		}

		// Find or create wallet
		let wallet = await prisma.wallet.findFirst({
			where: {
				userId: adminUser.id,
			},
		});

		if (!wallet) {
			wallet = await prisma.wallet.create({
				data: {
					userId: adminUser.id,
					balance: 0,
					availableForWithdrawal: 0,
					totalDeposits: 0,
					totalWithdrawals: 0,
				},
			});
		}

		// Add balance
		const addAmount = 10000; // Add RM 10,000
		await prisma.wallet.update({
			where: {
				id: wallet.id,
			},
			data: {
				balance: wallet.balance + addAmount,
				availableForWithdrawal:
					wallet.availableForWithdrawal + addAmount,
				totalDeposits: wallet.totalDeposits + addAmount,
			},
		});

		// Create a transaction record
		await prisma.walletTransaction.create({
			data: {
				userId: adminUser.id,
				walletId: wallet.id,
				type: "DEPOSIT",
				amount: addAmount,
				status: "APPROVED",
				description: `Test deposit for loan repayment testing - RM${addAmount.toLocaleString()}`,
				reference: `TEST-${Date.now()}`,
				processedAt: new Date(),
			},
		});

		console.log(
			`Successfully added RM${addAmount.toLocaleString()} to wallet`
		);
		console.log(
			`New balance: RM${(wallet.balance + addAmount).toLocaleString()}`
		);
	} catch (error) {
		console.error("Error adding wallet balance:", error);
	} finally {
		await prisma.$disconnect();
	}
}

addWalletBalance();
