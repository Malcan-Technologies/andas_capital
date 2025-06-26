const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testFreshFundsPayment() {
	try {
		console.log("🧪 Testing Fresh Funds Payment Recording...");

		// Find a user with an active loan
		const userWithLoan = await prisma.user.findFirst({
			where: {
				loans: {
					some: {
						status: "ACTIVE",
					},
				},
			},
			include: {
				loans: {
					where: {
						status: "ACTIVE",
					},
					take: 1,
				},
				wallet: true,
			},
		});

		if (!userWithLoan || userWithLoan.loans.length === 0) {
			console.log("❌ No user with active loan found");
			return;
		}

		const loan = userWithLoan.loans[0];
		const wallet = userWithLoan.wallet;

		if (!wallet) {
			console.log("❌ User has no wallet");
			return;
		}

		console.log(`✅ Found user: ${userWithLoan.fullName}`);
		console.log(
			`✅ Active loan: ${loan.id} (Outstanding: KES ${loan.outstandingBalance})`
		);

		// Create a fresh funds payment transaction
		const paymentAmount = Math.min(1000, loan.outstandingBalance); // Pay 1000 or remaining balance

		const transaction = await prisma.walletTransaction.create({
			data: {
				userId: userWithLoan.id,
				walletId: wallet.id,
				loanId: loan.id,
				type: "LOAN_REPAYMENT",
				amount: -paymentAmount, // Negative for outgoing payment
				status: "PENDING", // Fresh funds need approval
				description: `Test fresh funds loan repayment - KES ${paymentAmount}`,
				reference: `TEST-FRESH-${Date.now()}`,
				metadata: {
					paymentMethod: "FRESH_FUNDS",
					loanId: loan.id,
					outstandingBalance: loan.outstandingBalance,
					originalAmount: paymentAmount, // Store positive amount for reference
					testTransaction: true,
				},
			},
		});

		console.log(
			`✅ Created fresh funds payment transaction: ${transaction.id}`
		);
		console.log(`💰 Amount: KES ${paymentAmount}`);
		console.log(`📊 Status: ${transaction.status}`);
		console.log(`🔗 Reference: ${transaction.reference}`);

		// Check if it appears in pending repayments
		const pendingRepayments = await prisma.walletTransaction.findMany({
			where: {
				type: "LOAN_REPAYMENT",
				status: "PENDING",
			},
			include: {
				user: {
					select: {
						id: true,
						fullName: true,
						email: true,
						phoneNumber: true,
					},
				},
				loan: {
					include: {
						application: {
							include: {
								product: {
									select: {
										name: true,
									},
								},
							},
						},
					},
				},
			},
		});

		console.log(
			`\n📋 Total pending repayments: ${pendingRepayments.length}`
		);

		const ourTransaction = pendingRepayments.find(
			(t) => t.id === transaction.id
		);
		if (ourTransaction) {
			console.log(`✅ Our test transaction found in pending list!`);
			console.log(`👤 User: ${ourTransaction.user.fullName}`);
			console.log(
				`🏦 Product: ${ourTransaction.loan.application.product.name}`
			);
			console.log(
				`💳 Payment Method: ${ourTransaction.metadata.paymentMethod}`
			);
		} else {
			console.log(`❌ Our test transaction NOT found in pending list`);
		}

		console.log("\n🎯 Test completed successfully!");
		console.log(
			"💡 This transaction should now appear in the admin payments dashboard for approval."
		);
	} catch (error) {
		console.error("❌ Error testing fresh funds payment:", error);
	} finally {
		await prisma.$disconnect();
	}
}

testFreshFundsPayment();
