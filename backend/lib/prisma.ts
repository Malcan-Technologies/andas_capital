import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client with error handling
const prisma = new PrismaClient({
	log: ["query", "info", "warn", "error"],
});

// Test the database connection
prisma
	.$connect()
	.then(() => {
		console.log("Successfully connected to the database");
	})
	.catch((error) => {
		console.error("Failed to connect to the database:", error);
		// Don't exit the process, just log the error
		// This allows the application to retry the connection later
	});

export default prisma;
