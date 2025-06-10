const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestLoans() {
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

		// Find or create a product
		let product = await prisma.product.findFirst({
			where: {
				code: "SME_TERM_LOAN",
			},
		});

		if (!product) {
			product = await prisma.product.create({
				data: {
					code: "SME_TERM_LOAN",
					name: "SME Term Loan",
					description: "Small and Medium Enterprise Term Loan",
					minAmount: 10000,
					maxAmount: 500000,
					repaymentTerms: [12, 24, 36, 48, 60],
					interestRate: 8.5,
					eligibility: [
						"Business registration",
						"Financial statements",
					],
					lateFee: 50,
					originationFee: 200,
					legalFee: 150,
					applicationFee: 100,
					requiredDocuments: [
						"IC",
						"Business registration",
						"Bank statements",
					],
					features: ["Flexible repayment", "Competitive rates"],
					loanTypes: ["Term Loan"],
					isActive: true,
				},
			});
		}

		// Create a loan application
		const application = await prisma.loanApplication.create({
			data: {
				userId: adminUser.id,
				productId: product.id,
				amount: 50000,
				term: 24,
				purpose: "Business expansion",
				monthlyRepayment: 2291.67,
				interestRate: 8.5,
				lateFee: 50,
				originationFee: 200,
				legalFee: 150,
				applicationFee: 100,
				netDisbursement: 49550,
				acceptTerms: true,
				paidAppFee: true,
				appStep: 10,
				status: "APPROVED",
			},
		});

		// Create the loan
		const loan = await prisma.loan.create({
			data: {
				userId: adminUser.id,
				applicationId: application.id,
				principalAmount: 50000,
				outstandingBalance: 35000, // Some payments already made
				interestRate: 8.5,
				term: 24,
				monthlyPayment: 2291.67,
				nextPaymentDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
				status: "ACTIVE",
				disbursedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // Disbursed 6 months ago
			},
		});

		// Create another loan
		const application2 = await prisma.loanApplication.create({
			data: {
				userId: adminUser.id,
				productId: product.id,
				amount: 25000,
				term: 12,
				purpose: "Equipment purchase",
				monthlyRepayment: 2200,
				interestRate: 8.5,
				lateFee: 50,
				originationFee: 200,
				legalFee: 150,
				applicationFee: 100,
				netDisbursement: 24550,
				acceptTerms: true,
				paidAppFee: true,
				appStep: 10,
				status: "APPROVED",
			},
		});

		const loan2 = await prisma.loan.create({
			data: {
				userId: adminUser.id,
				applicationId: application2.id,
				principalAmount: 25000,
				outstandingBalance: 18000,
				interestRate: 8.5,
				term: 12,
				monthlyPayment: 2200,
				nextPaymentDue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Due in 14 days
				status: "ACTIVE",
				disbursedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Disbursed 3 months ago
			},
		});

		console.log("Test loans created successfully!");
		console.log(
			"Loan 1:",
			loan.id,
			"- Outstanding:",
			loan.outstandingBalance
		);
		console.log(
			"Loan 2:",
			loan2.id,
			"- Outstanding:",
			loan2.outstandingBalance
		);
	} catch (error) {
		console.error("Error creating test loans:", error);
	} finally {
		await prisma.$disconnect();
	}
}

createTestLoans();
