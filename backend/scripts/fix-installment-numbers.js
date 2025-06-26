const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixInstallmentNumbers() {
	console.log("🔧 Fixing missing installment numbers...");

	try {
		// Get all loans with repayments
		const loans = await prisma.loan.findMany({
			include: {
				repayments: {
					orderBy: {
						dueDate: "asc",
					},
				},
			},
		});

		console.log(`Found ${loans.length} loans to check`);

		for (const loan of loans) {
			console.log(`\n📋 Checking loan ${loan.id}:`);
			console.log(`  • ${loan.repayments.length} repayments found`);

			// Check if any repayments are missing installmentNumber
			const missingNumbers = loan.repayments.filter(
				(r) => !r.installmentNumber
			);

			if (missingNumbers.length > 0) {
				console.log(
					`  • ${missingNumbers.length} repayments missing installment numbers`
				);

				// Update each repayment with correct installment number
				for (let i = 0; i < loan.repayments.length; i++) {
					const repayment = loan.repayments[i];
					const correctInstallmentNumber = i + 1;

					if (
						!repayment.installmentNumber ||
						repayment.installmentNumber !== correctInstallmentNumber
					) {
						await prisma.loanRepayment.update({
							where: { id: repayment.id },
							data: {
								installmentNumber: correctInstallmentNumber,
							},
						});

						console.log(
							`    ✅ Updated repayment ${repayment.id} to installment #${correctInstallmentNumber}`
						);
					}
				}
			} else {
				console.log(`  ✅ All repayments have installment numbers`);
			}
		}

		console.log("\n🎉 Installment number fix completed!");
	} catch (error) {
		console.error("❌ Error fixing installment numbers:", error);
	} finally {
		await prisma.$disconnect();
	}
}

fixInstallmentNumbers();
