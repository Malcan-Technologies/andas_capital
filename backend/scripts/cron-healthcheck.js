#!/usr/bin/env node

/**
 * Cron Healthcheck Script
 *
 * This script runs every hour to check if late fee processing is working correctly.
 * It monitors the processing logs and can alert if there are issues.
 */

// Use ts-node to import TypeScript source directly
require("ts-node/register");
const { LateFeeProcessor } = require("../src/lib/lateFeeProcessor.ts");
const fs = require("fs");
const path = require("path");

function getErrorCategory(error) {
	const errorMessage = error.message.toLowerCase();

	if (
		errorMessage.includes("can't reach database") ||
		errorMessage.includes("connect econnrefused")
	) {
		return {
			category: "DATABASE_CONNECTION",
			severity: "HIGH",
			userMessage:
				"Database connection failed - Backend services may be down",
			technicalMessage: error.message,
			suggestedAction:
				"Check if Docker containers are running and database is accessible",
		};
	}

	if (errorMessage.includes("prisma") || errorMessage.includes("query")) {
		return {
			category: "DATABASE_QUERY",
			severity: "HIGH",
			userMessage:
				"Database query failed - There may be a schema or data issue",
			technicalMessage: error.message,
			suggestedAction: "Check database schema and recent migrations",
		};
	}

	if (errorMessage.includes("timeout")) {
		return {
			category: "TIMEOUT",
			severity: "MEDIUM",
			userMessage: "Operation timed out - System may be under heavy load",
			technicalMessage: error.message,
			suggestedAction: "Check system resources and database performance",
		};
	}

	return {
		category: "UNKNOWN",
		severity: "MEDIUM",
		userMessage: "An unexpected error occurred during health check",
		technicalMessage: error.message,
		suggestedAction: "Check application logs for more details",
	};
}

function formatTimeAgo(dateString) {
	if (!dateString) return "Never";

	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffMinutes = Math.floor(diffMs / (1000 * 60));

	if (diffHours >= 24) {
		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
	} else if (diffHours >= 1) {
		return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
	} else if (diffMinutes >= 1) {
		return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
	} else {
		return "Just now";
	}
}

async function checkHealth() {
	console.log(`[${new Date().toISOString()}] Running cron healthcheck...`);

	try {
		// Get processing status
		const status = await LateFeeProcessor.getProcessingStatus();

		const now = new Date();

		// Check if processing ran today
		if (!status.processedToday) {
			// Only alert if it's after 2 AM (processing should have run at 1 AM)
			if (now.getHours() >= 2) {
				console.warn(
					`[${new Date().toISOString()}] ⚠️  Late fee processing has not run today`
				);
				console.warn(`   • Last processed: ${status.lastProcessed}`);
				console.warn(`   • Last status: ${status.lastStatus}`);
				if (status.lastError) {
					console.warn(`   • Last error: ${status.lastError}`);
				}

				// Create alert file for admin dashboard
				await createAlert("MISSING_PROCESSING", {
					severity: "HIGH",
					title: "Late Fee Processing Not Running",
					message:
						"Daily late fee processing has not run today - fees may not be calculated for overdue payments",
					details: {
						lastProcessed: status.lastProcessed,
						lastProcessedFormatted: formatTimeAgo(
							status.lastProcessed
						),
						lastStatus: status.lastStatus,
						lastError: status.lastError,
						expectedRunTime: "1:00 AM daily",
					},
					suggestedAction:
						"Check if cron jobs are running and backend services are healthy",
					impact: "Overdue loan payments may not have late fees calculated",
					category: "PROCESSING_SCHEDULE",
				});
			}
		} else {
			console.log(
				`[${new Date().toISOString()}] ✅ Late fee processing is healthy`
			);
			console.log(
				`   • Processed today: ${status.todayProcessingCount} times`
			);
			console.log(`   • Last status: ${status.lastStatus}`);

			// Clear any existing alerts
			await clearAlerts();
		}

		// Check for recent failures
		if (status.lastStatus === "FAILED" && status.lastProcessed) {
			const lastProcessed = new Date(status.lastProcessed);
			const hoursSinceLastProcess =
				(now.getTime() - lastProcessed.getTime()) / (1000 * 60 * 60);

			if (hoursSinceLastProcess < 24) {
				console.warn(
					`[${new Date().toISOString()}] ⚠️  Recent late fee processing failure detected`
				);
				console.warn(`   • Failed at: ${status.lastProcessed}`);
				console.warn(`   • Error: ${status.lastError}`);

				await createAlert("PROCESSING_FAILED", {
					severity: "HIGH",
					title: "Late Fee Processing Failed",
					message:
						"The last late fee processing run failed - some overdue payments may not have fees calculated",
					details: {
						failedAt: status.lastProcessed,
						failedAtFormatted: formatTimeAgo(status.lastProcessed),
						error: status.lastError,
						hoursSinceFailure:
							Math.round(hoursSinceLastProcess * 10) / 10,
					},
					suggestedAction:
						"Review error details and manually trigger processing if needed",
					impact: "Late fees may not be calculated for some overdue payments",
					category: "PROCESSING_ERROR",
				});
			}
		}
	} catch (error) {
		console.error(
			`[${new Date().toISOString()}] ❌ Healthcheck failed:`,
			error
		);

		const errorInfo = getErrorCategory(error);

		await createAlert("HEALTHCHECK_FAILED", {
			severity: errorInfo.severity,
			title: "System Health Check Failed",
			message: errorInfo.userMessage,
			details: {
				category: errorInfo.category,
				technicalError: errorInfo.technicalMessage,
				timestamp: new Date().toISOString(),
				healthcheckType: "Late Fee Processing Monitor",
			},
			suggestedAction: errorInfo.suggestedAction,
			impact: "Unable to monitor late fee processing status - system may have issues",
			category: errorInfo.category,
		});
	}
}

async function createAlert(type, data) {
	const alertsDir = "/app/logs/alerts";
	if (!fs.existsSync(alertsDir)) {
		fs.mkdirSync(alertsDir, { recursive: true });
	}

	const alertFile = path.join(
		alertsDir,
		`late-fee-${type.toLowerCase()}.json`
	);
	const alert = {
		type,
		timestamp: new Date().toISOString(),
		data: {
			...data,
			alertId: `${type}_${Date.now()}`,
			systemComponent: "Late Fee Processing",
			environment: process.env.NODE_ENV || "development",
		},
	};

	fs.writeFileSync(alertFile, JSON.stringify(alert, null, 2));
	console.log(`[${new Date().toISOString()}] 🚨 Alert created: ${alertFile}`);
}

async function clearAlerts() {
	const alertsDir = "/app/logs/alerts";
	if (fs.existsSync(alertsDir)) {
		const files = fs
			.readdirSync(alertsDir)
			.filter((file) => file.startsWith("late-fee-"));
		for (const file of files) {
			fs.unlinkSync(path.join(alertsDir, file));
		}
		if (files.length > 0) {
			console.log(
				`[${new Date().toISOString()}] 🧹 Cleared ${
					files.length
				} alert(s)`
			);
		}
	}
}

checkHealth();
