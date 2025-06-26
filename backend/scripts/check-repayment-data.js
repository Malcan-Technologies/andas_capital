const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkRepaymentData() {
	try {
		console.log("🔍 Checking Repayment Data in Database");
		console.log("=====================================");

		// Get all loans
		const loans = await prisma.loan.findMany({
			include: {
				repayments: {
					orderBy: {
						dueDate: "asc",
					},
				},
				application: {
					select: {
						id: true,
						amount: true,
					},
				},
			},
		});

		console.log(`📊 Found ${loans.length} loans in database`);

		for (const loan of loans) {
			console.log(`\n💰 Loan ID: ${loan.id}`);
			console.log(`   • Principal: RM${loan.principalAmount.toFixed(2)}`);
			console.log(`   • Term: ${loan.term} months`);
			console.log(`   • Status: ${loan.status}`);
			console.log(
				`   • Disbursed: ${
					loan.disbursedAt
						? loan.disbursedAt.toISOString().split("T")[0]
						: "Not disbursed"
				}`
			);
			console.log(`   • Repayments in DB: ${loan.repayments.length}`);

			if (loan.repayments.length > 0) {
				console.log(
					`   • First payment due: ${
						loan.repayments[0].dueDate.toISOString().split("T")[0]
					}`
				);
				console.log(
					`   • Last payment due: ${
						loan.repayments[loan.repayments.length - 1].dueDate
							.toISOString()
							.split("T")[0]
					}`
				);

				// Check payment statuses
				const statusCounts = loan.repayments.reduce((acc, r) => {
					acc[r.status] = (acc[r.status] || 0) + 1;
					return acc;
				}, {});
				console.log(`   • Status breakdown:`, statusCounts);

				// Check installment numbers
				const installmentNumbers = loan.repayments
					.filter((r) => r.installmentNumber)
					.map((r) => r.installmentNumber)
					.sort((a, b) => a - b);

				if (installmentNumbers.length > 0) {
					console.log(
						`   • Installment numbers: ${
							installmentNumbers[0]
						} to ${
							installmentNumbers[installmentNumbers.length - 1]
						}`
					);
				}
			} else {
				console.log(`   ⚠️  No repayments found for this loan!`);

				// Check if this loan should have repayments
				if (loan.status === "ACTIVE" && loan.disbursedAt) {
					console.log(
						`   🔧 This active loan should have repayments generated`
					);
				}
			}
		}

		// Check for any wallet transactions related to loan repayments
		console.log(`\n💳 Checking Wallet Transactions for Loan Repayments:`);
		const walletTransactions = await prisma.walletTransaction.findMany({
			where: {
				type: "LOAN_REPAYMENT",
			},
			include: {
				loan: {
					select: {
						id: true,
						principalAmount: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		console.log(
			`   • Found ${walletTransactions.length} loan repayment transactions`
		);

		if (walletTransactions.length > 0) {
			walletTransactions.forEach((tx, index) => {
				console.log(
					`   • Transaction ${index + 1}: RM${tx.amount.toFixed(
						2
					)} for loan ${tx.loanId} (${tx.status}) - ${
						tx.createdAt.toISOString().split("T")[0]
					}`
				);
			});
		}

		// Summary
		console.log(`\n📋 Summary:`);
		const totalRepayments = loans.reduce(
			(sum, loan) => sum + loan.repayments.length,
			0
		);
		console.log(`   • Total loans: ${loans.length}`);
		console.log(`   • Total repayment records: ${totalRepayments}`);
		console.log(
			`   • Total wallet transactions: ${walletTransactions.length}`
		);

		// Check for specific RM50k loan
		const rm50kLoan = loans.find((loan) => loan.principalAmount === 50000);
		if (rm50kLoan) {
			console.log(`\n🎯 RM50k Loan Analysis:`);
			console.log(`   • Loan ID: ${rm50kLoan.id}`);
			console.log(
				`   • Expected payments: ${rm50kLoan.term} (36 months)`
			);
			console.log(
				`   • Actual payments in DB: ${rm50kLoan.repayments.length}`
			);
			console.log(`   • Status: ${rm50kLoan.status}`);

			if (rm50kLoan.repayments.length !== rm50kLoan.term) {
				console.log(
					`   ❌ MISMATCH: Expected ${rm50kLoan.term} payments, found ${rm50kLoan.repayments.length}`
				);
			} else {
				console.log(`   ✅ Payment count matches expected term`);
			}
		}
	} catch (error) {
		console.error("❌ Error checking repayment data:", error);
	} finally {
		await prisma.$disconnect();
	}
}

checkRepaymentData();
