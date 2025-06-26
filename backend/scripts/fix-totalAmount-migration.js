#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixTotalAmountMigration() {
	try {
		console.log("🔧 Fixing totalAmount column for existing loans...");

		// Get all loans that have NULL totalAmount
		const loansWithoutTotalAmount = await prisma.$queryRaw`
            SELECT id, "principalAmount", "interestRate", term 
            FROM loans 
            WHERE "totalAmount" IS NULL
        `;

		console.log(
			`Found ${loansWithoutTotalAmount.length} loans without totalAmount`
		);

		if (loansWithoutTotalAmount.length === 0) {
			console.log("✅ No loans need totalAmount calculation");
			return;
		}

		// Calculate and update totalAmount for each loan
		let updatedCount = 0;

		for (const loan of loansWithoutTotalAmount) {
			const { id, principalAmount, interestRate, term } = loan;

			// Calculate total amount using flat rate calculation
			// Total interest = principal * monthly rate * term in months
			const monthlyInterestRate = interestRate / 100;
			const totalInterest = principalAmount * monthlyInterestRate * term;
			const totalAmount = principalAmount + totalInterest;

			// Update the loan with calculated totalAmount
			await prisma.$executeRaw`
                UPDATE loans 
                SET "totalAmount" = ${totalAmount}
                WHERE id = ${id}
            `;

			updatedCount++;
			console.log(
				`✅ Updated loan ${id}: totalAmount = ${totalAmount.toFixed(2)}`
			);
		}

		console.log(
			`✅ Successfully updated ${updatedCount} loans with totalAmount`
		);
	} catch (error) {
		console.error("❌ Error fixing totalAmount migration:", error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run the fix if called directly
if (require.main === module) {
	fixTotalAmountMigration()
		.then(() => {
			console.log("✅ totalAmount migration fix completed successfully");
			process.exit(0);
		})
		.catch((error) => {
			console.error("❌ totalAmount migration fix failed:", error);
			process.exit(1);
		});
}

module.exports = { fixTotalAmountMigration };
