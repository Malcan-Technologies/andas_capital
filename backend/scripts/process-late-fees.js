#!/usr/bin/env node

/**
 * Late Fee Processing Cron Job
 *
 * This script runs daily to calculate and apply late fees for overdue loan repayments.
 * It should be executed via cron at 1:00 AM daily.
 *
 * Usage: node scripts/process-late-fees.js
 */

// Use ts-node to import TypeScript source directly
require("ts-node/register");
const { LateFeeProcessor } = require("../src/lib/lateFeeProcessor.ts");

async function main() {
	console.log(
		`[${new Date().toISOString()}] Starting late fee processing...`
	);

	try {
		const result = await LateFeeProcessor.processLateFees();

		if (result.success) {
			console.log(
				`[${new Date().toISOString()}] ✅ Late fee processing completed successfully`
			);
			console.log(`   • Fees calculated: ${result.feesCalculated}`);
			console.log(
				`   • Total fee amount: $${result.totalFeeAmount.toFixed(2)}`
			);
			console.log(`   • Overdue repayments: ${result.overdueRepayments}`);
			console.log(`   • Processing time: ${result.processingTimeMs}ms`);
			process.exit(0);
		} else {
			console.error(
				`[${new Date().toISOString()}] ❌ Late fee processing failed`
			);
			console.error(`   • Error: ${result.errorMessage}`);
			console.error(`   • Fees calculated: ${result.feesCalculated}`);
			console.error(`   • Processing time: ${result.processingTimeMs}ms`);
			process.exit(1);
		}
	} catch (error) {
		console.error(
			`[${new Date().toISOString()}] ❌ Fatal error in late fee processing:`,
			error
		);
		process.exit(1);
	}
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
	console.error(
		`[${new Date().toISOString()}] ❌ Uncaught Exception:`,
		error
	);
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error(
		`[${new Date().toISOString()}] ❌ Unhandled Rejection at:`,
		promise,
		"reason:",
		reason
	);
	process.exit(1);
});

main();
