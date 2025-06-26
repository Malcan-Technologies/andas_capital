const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function resetTodaysLateFees() {
	console.log("🔄 Resetting today's late fees for testing...");

	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Find today's late fees
		const todaysLateFees = await prisma.lateFee.findMany({
			where: {
				calculationDate: {
					gte: today,
				},
			},
		});

		console.log(`📊 Found ${todaysLateFees.length} late fees from today`);

		if (todaysLateFees.length > 0) {
			// Delete today's late fees
			const deleteResult = await prisma.lateFee.deleteMany({
				where: {
					calculationDate: {
						gte: today,
					},
				},
			});

			console.log(`✅ Deleted ${deleteResult.count} late fee records`);
			console.log(
				"💡 You can now run manual processing to see new rates"
			);
		} else {
			console.log("ℹ️ No late fees found for today");
		}
	} catch (error) {
		console.error("❌ Error resetting late fees:", error);
	} finally {
		await prisma.$disconnect();
	}
}

resetTodaysLateFees();
