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

		// Only test database connection if we're not in build mode
		// During Docker build, DATABASE_URL might point to a service that doesn't exist yet
		const skipDbConnection =
			process.env.SKIP_DB_CONNECTION === "true" ||
			process.env.NODE_ENV === "build" ||
			!process.env.DATABASE_URL ||
			process.env.DATABASE_URL.includes("postgres:5432"); // Docker service name indicates build time

		if (skipDbConnection) {
			console.log(
				"ℹ️  Skipping database connection test (build mode or Docker service detected)"
			);
		} else {
			// Test database connection
			await prisma.$connect();
			console.log("✅ Database connection successful");
			await prisma.$disconnect();
		}

		console.log("✅ Prisma client verification completed successfully");
		console.log("ℹ️  Server should be running on port 4001");
	} catch (error) {
		console.error("❌ Prisma client verification failed:", error.message);
		process.exit(1);
	}
}

verifyPrismaClient();
