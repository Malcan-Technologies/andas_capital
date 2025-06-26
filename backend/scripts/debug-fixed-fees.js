const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugFixedFeeLogic() {
	console.log("🔍 Debugging Fixed Fee Logic...");

	// Get the overdue repayment data
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const query = `
    SELECT 
      lr.*,
      l.id as loan_id, 
      l."outstandingBalance", 
      l.status as loan_status,
      p."lateFeeRate",
      p."lateFeeFixedAmount",
      p."lateFeeFrequencyDays",
      COUNT(lf_fixed.id) as fixed_fee_count
    FROM loan_repayments lr
    JOIN loans l ON lr."loanId" = l.id
    JOIN loan_applications la ON l."applicationId" = la.id
    JOIN products p ON la."productId" = p.id
    LEFT JOIN late_fees lf_fixed ON lr.id = lf_fixed."loanRepaymentId" 
      AND lf_fixed."calculationDate" >= $1 
      AND lf_fixed."feeType" = 'FIXED'
    WHERE lr.status IN ('PENDING', 'PARTIAL')
      AND lr."dueDate" < $1
      AND l.status = 'ACTIVE'
    GROUP BY lr.id, l.id, l."outstandingBalance", l.status, 
             p."lateFeeRate", p."lateFeeFixedAmount", p."lateFeeFrequencyDays"
  `;

	const repayments = await prisma.$queryRawUnsafe(query, today);

	for (const repayment of repayments) {
		console.log(`\n📊 Repayment: ${repayment.id.substring(0, 8)}...`);
		console.log(
			`   Due Date: ${repayment.dueDate.toISOString().split("T")[0]}`
		);

		// Calculate days overdue
		const dueDate = new Date(repayment.dueDate);
		dueDate.setHours(0, 0, 0, 0);
		const daysOverdue = Math.floor(
			(today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
		);

		console.log(`   Days Overdue: ${daysOverdue}`);
		console.log(`   Fixed Fee Amount: RM ${repayment.lateFeeFixedAmount}`);
		console.log(`   Frequency Days: ${repayment.lateFeeFrequencyDays}`);
		console.log(`   Fixed Fee Count Today: ${repayment.fixed_fee_count}`);

		// Check fixed fee conditions
		const fixedFeeAmount = Number(repayment.lateFeeFixedAmount);
		const frequencyDays = Number(repayment.lateFeeFrequencyDays);

		console.log(`\n🔍 Fixed Fee Conditions:`);
		console.log(
			`   1. Fixed fee amount > 0: ${
				fixedFeeAmount > 0
			} (RM ${fixedFeeAmount})`
		);
		console.log(
			`   2. Frequency days > 0: ${
				frequencyDays > 0
			} (${frequencyDays} days)`
		);
		console.log(
			`   3. Days overdue > 0: ${daysOverdue > 0} (${daysOverdue} days)`
		);

		// Check if should charge today
		const shouldChargeToday = daysOverdue % frequencyDays === 0;
		console.log(
			`   4. Should charge today (${daysOverdue} % ${frequencyDays} === 0): ${shouldChargeToday}`
		);
		console.log(
			`   5. No fixed fee calculated today: ${
				Number(repayment.fixed_fee_count) === 0
			}`
		);

		const allConditionsMet =
			fixedFeeAmount > 0 &&
			frequencyDays > 0 &&
			daysOverdue > 0 &&
			shouldChargeToday &&
			Number(repayment.fixed_fee_count) === 0;
		console.log(
			`\n✅ All conditions met for fixed fee: ${allConditionsMet}`
		);

		if (!shouldChargeToday) {
			const chargeDays = [];
			for (
				let day = frequencyDays;
				day <= daysOverdue + 30;
				day += frequencyDays
			) {
				chargeDays.push(day);
			}
			console.log(
				`💡 Fixed fee will be charged on days: ${chargeDays
					.slice(0, 5)
					.join(", ")}${chargeDays.length > 5 ? "..." : ""}`
			);
		}
	}

	await prisma.$disconnect();
}

debugFixedFeeLogic().catch(console.error);
