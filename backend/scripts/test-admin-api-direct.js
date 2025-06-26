const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Import the admin API functions directly
async function testAdminApiDirect() {
	try {
		console.log("🧪 Testing Admin API Direct Call");
		console.log("=================================");

		// Find a loan with repayments
		const loan = await prisma.loan.findFirst({
			where: {
				status: "ACTIVE",
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
				application: {
					include: {
						product: {
							select: {
								name: true,
								code: true,
							},
						},
					},
				},
				repayments: {
					orderBy: {
						dueDate: "asc",
					},
				},
			},
		});

		if (!loan) {
			console.log("❌ No active loans found");
			return;
		}

		console.log(`📋 Testing with Loan ID: ${loan.id}`);
		console.log(`💰 Principal: RM${loan.principalAmount.toFixed(2)}`);
		console.log(`📅 Term: ${loan.term} months`);
		console.log(`📊 Repayments in database: ${loan.repayments.length}`);

		// Test the prepayment adjustment function directly
		console.log(`\n🔄 Testing Prepayment Adjustments Function:`);

		// Get payments made for this loan
		const payments = await prisma.walletTransaction.findMany({
			where: {
				loanId: loan.id,
				type: "LOAN_REPAYMENT",
				status: "COMPLETED",
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		const totalPaid = payments.reduce(
			(sum, payment) => sum + payment.amount,
			0
		);
		console.log(`   • Total payments made: ${payments.length}`);
		console.log(`   • Total amount paid: RM${totalPaid.toFixed(2)}`);

		// Apply prepayment adjustments (simulate the function)
		const adjustedLoan = await applyPrepaymentAdjustments(loan);

		console.log(`\n📊 After Prepayment Adjustments:`);
		console.log(`   • Original repayments: ${loan.repayments.length}`);
		console.log(
			`   • Adjusted repayments: ${adjustedLoan.repayments.length}`
		);
		console.log(`   • Total paid: ${adjustedLoan.totalPaid || 0}`);
		console.log(
			`   • Remaining prepayment: ${
				adjustedLoan.remainingPrepayment || 0
			}`
		);

		// Check the structure of adjusted repayments
		if (adjustedLoan.repayments.length > 0) {
			console.log(`\n📋 Sample Adjusted Repayments (first 5):`);
			adjustedLoan.repayments.slice(0, 5).forEach((payment, index) => {
				const adjustedAmount =
					payment.adjustedAmount !== undefined
						? payment.adjustedAmount
						: payment.amount;
				const prepaymentApplied = payment.prepaymentApplied || 0;
				console.log(
					`   ${index + 1}. ${
						payment.dueDate
					} - Original: RM${payment.amount.toFixed(
						2
					)}, Adjusted: RM${adjustedAmount.toFixed(
						2
					)}, Prepaid: RM${prepaymentApplied.toFixed(2)} (${
						payment.status
					})`
				);
			});

			if (adjustedLoan.repayments.length > 10) {
				console.log(`\n📋 Sample Adjusted Repayments (last 5):`);
				adjustedLoan.repayments.slice(-5).forEach((payment, index) => {
					const actualIndex =
						adjustedLoan.repayments.length - 5 + index + 1;
					const adjustedAmount =
						payment.adjustedAmount !== undefined
							? payment.adjustedAmount
							: payment.amount;
					const prepaymentApplied = payment.prepaymentApplied || 0;
					console.log(
						`   ${actualIndex}. ${
							payment.dueDate
						} - Original: RM${payment.amount.toFixed(
							2
						)}, Adjusted: RM${adjustedAmount.toFixed(
							2
						)}, Prepaid: RM${prepaymentApplied.toFixed(2)} (${
							payment.status
						})`
					);
				});
			}
		}

		console.log(`\n✅ Direct API test completed!`);
	} catch (error) {
		console.error("❌ Error testing direct API:", error);
	} finally {
		await prisma.$disconnect();
	}
}

// Simulate the prepayment adjustment function
async function applyPrepaymentAdjustments(loan) {
	// Get all payments made for this loan from wallet_transactions
	const payments = await prisma.walletTransaction.findMany({
		where: {
			loanId: loan.id,
			type: "LOAN_REPAYMENT",
			status: "COMPLETED",
		},
		orderBy: {
			createdAt: "asc",
		},
	});

	// Calculate total amount paid
	const totalPaid = payments.reduce(
		(sum, payment) => sum + payment.amount,
		0
	);

	if (totalPaid === 0) {
		// No payments made, return original schedule
		return loan;
	}

	console.log(`Applying prepayment adjustments for loan ${loan.id}:`);
	console.log(`Total paid: ${totalPaid}`);

	// Get the original payment schedule (pending payments only)
	const pendingRepayments = loan.repayments.filter(
		(r) => r.status === "PENDING"
	);

	// Calculate how much should be deducted from future payments
	let remainingPrepayment = totalPaid;
	const adjustedRepayments = [];

	// Process each pending payment in order
	for (const repayment of pendingRepayments) {
		if (remainingPrepayment <= 0) {
			// No more prepayment to apply, keep original amount
			adjustedRepayments.push({
				...repayment,
				adjustedAmount: repayment.amount,
				prepaymentApplied: 0,
			});
		} else if (remainingPrepayment >= repayment.amount) {
			// Prepayment covers this entire payment
			adjustedRepayments.push({
				...repayment,
				adjustedAmount: 0,
				prepaymentApplied: repayment.amount,
				status: "PREPAID",
			});
			remainingPrepayment -= repayment.amount;
		} else {
			// Prepayment partially covers this payment
			adjustedRepayments.push({
				...repayment,
				adjustedAmount: repayment.amount - remainingPrepayment,
				prepaymentApplied: remainingPrepayment,
			});
			remainingPrepayment = 0;
		}
	}

	// Include completed payments from the original schedule
	const completedRepayments = loan.repayments.filter(
		(r) => r.status === "COMPLETED"
	);

	// Return loan with adjusted repayments
	return {
		...loan,
		repayments: [...completedRepayments, ...adjustedRepayments],
		totalPaid,
		remainingPrepayment,
	};
}

testAdminApiDirect();
