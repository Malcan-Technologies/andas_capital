#!/usr/bin/env node

/**
 * Enhanced Cron Healthcheck Script
 * Monitors late fee processing, database health, and migration status
 * Provides comprehensive system health monitoring
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
	ALERT_DIR:
		process.env.NODE_ENV === "production"
			? "/app/logs/alerts"
			: "./logs/alerts",
	LOG_DIR: process.env.NODE_ENV === "production" ? "/app/logs" : "./logs",
	MAX_ALERT_AGE_HOURS: 24,
	HEALTHCHECK_TIMEOUT_MS: 30000,
	DATABASE_URL:
		process.env.DATABASE_URL ||
		"postgresql://postgres:password@postgres:5432/kapital",
};

// Utility functions
function ensureDirectoryExists(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

function getTimestamp() {
	return new Date().toISOString();
}

function formatTimeAgo(date) {
	const now = new Date();
	const diffMs = now - new Date(date);
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

	if (diffHours > 0) {
		return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
	} else if (diffMinutes > 0) {
		return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
	} else {
		return "Just now";
	}
}

function categorizeError(error) {
	const errorStr = error.toString().toLowerCase();

	if (
		errorStr.includes("econnrefused") ||
		errorStr.includes("connection refused")
	) {
		return {
			category: "DATABASE_CONNECTION",
			severity: "HIGH",
			title: "Database Connection Failed",
			message: "Unable to connect to the database server",
			impact: "All loan processing and late fee calculations are stopped",
			suggestions: [
				"Check if PostgreSQL container is running",
				"Verify database connection settings",
				"Run: docker compose -f docker-compose.dev.yml up postgres -d",
			],
		};
	}

	if (errorStr.includes("migration") || errorStr.includes("p3009")) {
		return {
			category: "DATABASE_MIGRATION",
			severity: "HIGH",
			title: "Database Migration Issue",
			message: "Database schema is out of sync or has failed migrations",
			impact: "Application may fail to start or function incorrectly",
			suggestions: [
				"Run the migration fix script: ./scripts/fix-migration-issue.sh",
				"Check migration status with: npx prisma migrate status",
				"Contact system administrator if issue persists",
			],
		};
	}

	if (errorStr.includes("timeout") || errorStr.includes("timed out")) {
		return {
			category: "TIMEOUT",
			severity: "MEDIUM",
			title: "Database Query Timeout",
			message: "Database queries are taking too long to complete",
			impact: "Slow response times and potential service interruptions",
			suggestions: [
				"Check database performance and load",
				"Review slow query logs",
				"Consider database optimization",
			],
		};
	}

	if (errorStr.includes("permission") || errorStr.includes("access denied")) {
		return {
			category: "PERMISSION",
			severity: "HIGH",
			title: "Database Permission Error",
			message: "Insufficient permissions to access database",
			impact: "Critical operations may fail",
			suggestions: [
				"Check database user permissions",
				"Verify connection credentials",
				"Review database access policies",
			],
		};
	}

	return {
		category: "UNKNOWN",
		severity: "MEDIUM",
		title: "System Health Check Failed",
		message: "An unexpected error occurred during health monitoring",
		impact: "System status unknown, manual investigation required",
		suggestions: [
			"Check application logs for more details",
			"Verify all services are running properly",
			"Contact system administrator",
		],
	};
}

function createAlert(errorInfo, originalError) {
	const alertId = `healthcheck_${Date.now()}_${Math.random()
		.toString(36)
		.substr(2, 9)}`;
	const timestamp = getTimestamp();

	const alert = {
		id: alertId,
		timestamp,
		category: errorInfo.category,
		severity: errorInfo.severity,
		title: errorInfo.title,
		message: errorInfo.message,
		impact: errorInfo.impact,
		suggestions: errorInfo.suggestions,
		technicalDetails: {
			originalError: originalError.toString(),
			errorStack: originalError.stack || "No stack trace available",
			environment: process.env.NODE_ENV || "development",
			component: "cron-healthcheck",
			timestamp,
			timeAgo: formatTimeAgo(timestamp),
		},
		resolved: false,
		acknowledgedBy: null,
		acknowledgedAt: null,
	};

	return alert;
}

function saveAlert(alert) {
	ensureDirectoryExists(CONFIG.ALERT_DIR);

	const filename = `${alert.category.toLowerCase()}_${alert.id}.json`;
	const filepath = path.join(CONFIG.ALERT_DIR, filename);

	try {
		fs.writeFileSync(filepath, JSON.stringify(alert, null, 2));
		console.log(`Alert saved: ${filepath}`);
		return true;
	} catch (error) {
		console.error("Failed to save alert:", error);
		return false;
	}
}

function logHealthcheck(status, details = {}) {
	ensureDirectoryExists(CONFIG.LOG_DIR);

	const logEntry = {
		timestamp: getTimestamp(),
		status,
		component: "enhanced-cron-healthcheck",
		...details,
	};

	const logFile = path.join(CONFIG.LOG_DIR, "healthcheck.log");
	const logLine = JSON.stringify(logEntry) + "\n";

	try {
		fs.appendFileSync(logFile, logLine);
	} catch (error) {
		console.error("Failed to write to log file:", error);
	}
}

async function checkDatabaseConnection() {
	try {
		const { PrismaClient } = require("@prisma/client");
		const prisma = new PrismaClient();

		// Test basic connection
		await prisma.$connect();

		// Test a simple query
		const result = await prisma.$queryRaw`SELECT 1 as test`;

		await prisma.$disconnect();

		return { success: true, details: "Database connection successful" };
	} catch (error) {
		return { success: false, error };
	}
}

async function checkMigrationStatus() {
	try {
		const { stdout, stderr } = await execAsync(
			"npx prisma migrate status",
			{
				timeout: CONFIG.HEALTHCHECK_TIMEOUT_MS,
				cwd: process.cwd(),
			}
		);

		if (stderr && stderr.includes("Error")) {
			throw new Error(`Migration check failed: ${stderr}`);
		}

		return { success: true, details: "All migrations are up to date" };
	} catch (error) {
		return { success: false, error };
	}
}

async function checkLateFeeProcessing() {
	try {
		const { PrismaClient } = require("@prisma/client");
		const prisma = new PrismaClient();

		// Check if late fees table is accessible
		const lateFeeCount = await prisma.lateFee.count();

		// Check recent late fee processing (within last 24 hours)
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);

		const recentLateFees = await prisma.lateFee.count({
			where: {
				createdAt: {
					gte: yesterday,
				},
			},
		});

		await prisma.$disconnect();

		return {
			success: true,
			details: `Late fee system operational. Total fees: ${lateFeeCount}, Recent: ${recentLateFees}`,
		};
	} catch (error) {
		return { success: false, error };
	}
}

async function cleanupOldAlerts() {
	try {
		if (!fs.existsSync(CONFIG.ALERT_DIR)) {
			return;
		}

		const files = fs.readdirSync(CONFIG.ALERT_DIR);
		const cutoffTime =
			Date.now() - CONFIG.MAX_ALERT_AGE_HOURS * 60 * 60 * 1000;

		let cleanedCount = 0;

		for (const file of files) {
			if (file.endsWith(".json")) {
				const filepath = path.join(CONFIG.ALERT_DIR, file);
				const stats = fs.statSync(filepath);

				if (stats.mtime.getTime() < cutoffTime) {
					try {
						// Check if alert is resolved before deleting
						const alertData = JSON.parse(
							fs.readFileSync(filepath, "utf8")
						);
						if (alertData.resolved) {
							fs.unlinkSync(filepath);
							cleanedCount++;
						}
					} catch (error) {
						// If we can't read the alert file, delete it anyway
						fs.unlinkSync(filepath);
						cleanedCount++;
					}
				}
			}
		}

		if (cleanedCount > 0) {
			console.log(`Cleaned up ${cleanedCount} old alert files`);
		}
	} catch (error) {
		console.error("Error cleaning up old alerts:", error);
	}
}

async function runHealthcheck() {
	console.log(`Starting enhanced healthcheck at ${getTimestamp()}`);

	const results = {
		database: null,
		migrations: null,
		lateFees: null,
		overall: "UNKNOWN",
	};

	try {
		// Clean up old alerts first
		await cleanupOldAlerts();

		// Check database connection
		console.log("Checking database connection...");
		results.database = await checkDatabaseConnection();

		if (!results.database.success) {
			throw results.database.error;
		}

		// Check migration status
		console.log("Checking migration status...");
		results.migrations = await checkMigrationStatus();

		if (!results.migrations.success) {
			throw results.migrations.error;
		}

		// Check late fee processing
		console.log("Checking late fee processing...");
		results.lateFees = await checkLateFeeProcessing();

		if (!results.lateFees.success) {
			throw results.lateFees.error;
		}

		// All checks passed
		results.overall = "HEALTHY";

		logHealthcheck("SUCCESS", {
			database: results.database.details,
			migrations: results.migrations.details,
			lateFees: results.lateFees.details,
		});

		console.log("✅ All health checks passed");
	} catch (error) {
		console.error("❌ Health check failed:", error.message);

		results.overall = "UNHEALTHY";

		// Categorize the error and create an alert
		const errorInfo = categorizeError(error);
		const alert = createAlert(errorInfo, error);

		// Save the alert
		if (saveAlert(alert)) {
			console.log(`Alert created with ID: ${alert.id}`);
		}

		// Log the failure
		logHealthcheck("FAILED", {
			error: error.message,
			category: errorInfo.category,
			severity: errorInfo.severity,
			alertId: alert.id,
		});

		// Exit with error code for monitoring systems
		process.exit(1);
	}
}

// Handle graceful shutdown
process.on("SIGINT", () => {
	console.log("Healthcheck interrupted");
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.log("Healthcheck terminated");
	process.exit(0);
});

// Run the healthcheck
if (require.main === module) {
	runHealthcheck().catch((error) => {
		console.error("Unhandled error in healthcheck:", error);
		process.exit(1);
	});
}

module.exports = {
	runHealthcheck,
	checkDatabaseConnection,
	checkMigrationStatus,
	checkLateFeeProcessing,
	categorizeError,
	createAlert,
};
