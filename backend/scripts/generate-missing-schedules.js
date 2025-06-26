const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function generateMissingSchedules() {
	try {
		console.log("🔧 Generating Missing Payment Schedules");
		console.log("======================================");

		// Find all active loans
		const loans = await prisma.loan.findMany({
			where: {
				status: "ACTIVE",
				disbursedAt: {
					not: null,
				},
			},
			include: {
				repayments: true,
			},
		});

		console.log(`📊 Found ${loans.length} active loans`);

		for (const loan of loans) {
			console.log(`\n💰 Processing Loan ID: ${loan.id}`);
			console.log(`   • Principal: RM${loan.principalAmount.toFixed(2)}`);
			console.log(`   • Term: ${loan.term} months`);
			console.log(`   • Current repayments: ${loan.repayments.length}`);

			if (loan.repayments.length === 0) {
				console.log(`   🔧 Generating payment schedule...`);
				await generatePaymentSchedule(loan);
			} else if (loan.repayments.length !== loan.term) {
				console.log(
					`   ⚠️  Repayment count mismatch! Expected: ${loan.term}, Found: ${loan.repayments.length}`
				);
				console.log(`   🔧 Regenerating payment schedule...`);

				// Clear existing schedule
				await prisma.loanRepayment.deleteMany({
					where: { loanId: loan.id },
				});

				await generatePaymentSchedule(loan);
			} else {
				console.log(`   ✅ Payment schedule already complete`);
			}
		}

		console.log(`\n✅ Payment schedule generation completed!`);
	} catch (error) {
		console.error("❌ Error generating payment schedules:", error);
	} finally {
		await prisma.$disconnect();
	}
}

async function generatePaymentSchedule(loan) {
	if (!loan.disbursedAt) {
		throw new Error("Loan not disbursed");
	}

	const repayments = [];

	// Flat rate calculation: (Principal + Total Interest) / Term
	const monthlyInterestRate = loan.interestRate / 100;
	const totalInterest =
		loan.principalAmount * monthlyInterestRate * loan.term;
	const monthlyPayment = (loan.principalAmount + totalInterest) / loan.term;

	// Calculate interest and principal portions for flat rate
	const monthlyInterestAmount = totalInterest / loan.term;
	const monthlyPrincipalAmount = loan.principalAmount / loan.term;

	console.log(`   • Monthly Payment: RM${monthlyPayment.toFixed(2)}`);
	console.log(
		`   • Monthly Principal: RM${monthlyPrincipalAmount.toFixed(2)}`
	);
	console.log(`   • Monthly Interest: RM${monthlyInterestAmount.toFixed(2)}`);

	for (let month = 1; month <= loan.term; month++) {
		// Set due date to end of day exactly 1 month from disbursement
		// Use UTC date manipulation to avoid timezone issues
		const disbursementDate = new Date(loan.disbursedAt);

		// Create due date by adding months using UTC methods
		// Set to 15:59:59 UTC so it becomes 23:59:59 Malaysia time (GMT+8)
		const dueDate = new Date(
			Date.UTC(
				disbursementDate.getUTCFullYear(),
				disbursementDate.getUTCMonth() + month,
				disbursementDate.getUTCDate(),
				15,
				59,
				59,
				999
			)
		);

		repayments.push({
			loanId: loan.id,
			amount: monthlyPayment,
			principalAmount: monthlyPrincipalAmount,
			interestAmount: monthlyInterestAmount,
			status: "PENDING",
			dueDate: dueDate,
			installmentNumber: month,
			scheduledAmount: monthlyPayment,
		});
	}

	// Create all repayment records
	await prisma.loanRepayment.createMany({
		data: repayments,
	});

	// Update loan with next payment due date and correct monthly payment
	if (repayments.length > 0) {
		await prisma.loan.update({
			where: { id: loan.id },
			data: {
				monthlyPayment: monthlyPayment,
				nextPaymentDue: repayments[0].dueDate,
			},
		});
	}

	console.log(`   ✅ Created ${repayments.length} payment records`);
	return repayments;
}

generateMissingSchedules();
