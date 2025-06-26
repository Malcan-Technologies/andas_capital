const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testApiResponse() {
	try {
		console.log("🧪 Testing API Response for Loan Repayments");
		console.log("============================================");

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

		// Simulate the API response structure
		const apiResponse = {
			success: true,
			data: loan,
		};

		console.log(`\n🔍 API Response Analysis:`);
		console.log(`   • Success: ${apiResponse.success}`);
		console.log(`   • Data exists: ${!!apiResponse.data}`);
		console.log(
			`   • Repayments array length: ${apiResponse.data.repayments.length}`
		);

		if (apiResponse.data.repayments.length > 0) {
			console.log(`\n📅 Repayment Schedule Details:`);
			console.log(
				`   • First payment: ${
					apiResponse.data.repayments[0].dueDate
						.toISOString()
						.split("T")[0]
				}`
			);
			console.log(
				`   • Last payment: ${
					apiResponse.data.repayments[
						apiResponse.data.repayments.length - 1
					].dueDate
						.toISOString()
						.split("T")[0]
				}`
			);

			// Show first 5 and last 5 payments
			console.log(`\n📋 First 5 Payments:`);
			apiResponse.data.repayments
				.slice(0, 5)
				.forEach((payment, index) => {
					console.log(
						`   ${index + 1}. ${
							payment.dueDate.toISOString().split("T")[0]
						} - RM${payment.amount.toFixed(2)} (${payment.status})`
					);
				});

			if (apiResponse.data.repayments.length > 10) {
				console.log(`\n📋 Last 5 Payments:`);
				apiResponse.data.repayments
					.slice(-5)
					.forEach((payment, index) => {
						const actualIndex =
							apiResponse.data.repayments.length - 5 + index + 1;
						console.log(
							`   ${actualIndex}. ${
								payment.dueDate.toISOString().split("T")[0]
							} - RM${payment.amount.toFixed(2)} (${
								payment.status
							})`
						);
					});
			}

			// Check for installment numbers
			const withInstallmentNumbers = apiResponse.data.repayments.filter(
				(r) => r.installmentNumber
			);
			console.log(`\n🔢 Installment Numbers:`);
			console.log(
				`   • Payments with installment numbers: ${withInstallmentNumbers.length}`
			);

			if (withInstallmentNumbers.length > 0) {
				const installmentNumbers = withInstallmentNumbers
					.map((r) => r.installmentNumber)
					.sort((a, b) => a - b);
				console.log(
					`   • Range: ${installmentNumbers[0]} to ${
						installmentNumbers[installmentNumbers.length - 1]
					}`
				);
			}
		}

		// Test the prepayment adjustment function
		console.log(`\n🔄 Testing Prepayment Adjustments:`);

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

		if (totalPaid > 0) {
			// Simulate prepayment adjustment
			const pendingRepayments = loan.repayments.filter(
				(r) => r.status === "PENDING"
			);
			let remainingPrepayment = totalPaid;
			let adjustedCount = 0;

			for (const repayment of pendingRepayments) {
				if (remainingPrepayment > 0) {
					if (remainingPrepayment >= repayment.amount) {
						adjustedCount++;
						remainingPrepayment -= repayment.amount;
					} else {
						adjustedCount++;
						remainingPrepayment = 0;
						break;
					}
				}
			}

			console.log(
				`   • Payments that would be adjusted: ${adjustedCount}`
			);
			console.log(
				`   • Remaining prepayment: RM${remainingPrepayment.toFixed(2)}`
			);
		}

		console.log(`\n✅ Test completed successfully!`);
	} catch (error) {
		console.error("❌ Error testing API response:", error);
	} finally {
		await prisma.$disconnect();
	}
}

testApiResponse();
