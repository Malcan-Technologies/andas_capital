const { PrismaClient } = require("@prisma/client");

async function verifyPrismaClient() {
	try {
		const prisma = new PrismaClient();

		// Check if all required models are available
		const requiredModels = [
			"user",
			"product",
			"loanApplication",
			"loanApplicationHistory",
			"loan",
			"wallet",
			"walletTransaction",
			"notification",
			"userDocument",
		];

		console.log("Verifying Prisma client models...");

		for (const model of requiredModels) {
			if (!prisma[model]) {
				console.error(
					`❌ Model '${model}' is not available in Prisma client`
				);
				process.exit(1);
			} else {
				console.log(`✅ Model '${model}' is available`);
			}
		}

		// Test database connection
		await prisma.$connect();
		console.log("✅ Database connection successful");

		await prisma.$disconnect();
		console.log("✅ Prisma client verification completed successfully");
		console.log("ℹ️  Server should be running on port 4001");
	} catch (error) {
		console.error("❌ Prisma client verification failed:", error.message);
		process.exit(1);
	}
}

verifyPrismaClient();
