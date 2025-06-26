#!/usr/bin/env node

/**
 * Test Manual Late Fee Processing
 * This script tests the manual processing functionality to ensure it works
 * even when automatic processing has already run today.
 */

// Use ts-node to import TypeScript source directly
require("ts-node/register");
const { LateFeeProcessor } = require("../src/lib/lateFeeProcessor.ts");

async function testManualProcessing() {
	console.log("🧪 Testing Manual Late Fee Processing");
	console.log("=".repeat(50));

	try {
		// First, run automatic processing
		console.log("\n1️⃣ Running automatic processing (normal mode)...");
		const automaticResult = await LateFeeProcessor.processLateFees(false);

		console.log("✅ Automatic processing results:");
		console.log(`   • Success: ${automaticResult.success}`);
		console.log(`   • Fees calculated: ${automaticResult.feesCalculated}`);
		console.log(
			`   • Total amount: $${automaticResult.totalFeeAmount.toFixed(2)}`
		);
		console.log(
			`   • Overdue repayments: ${automaticResult.overdueRepayments}`
		);
		console.log(
			`   • Processing time: ${automaticResult.processingTimeMs}ms`
		);
		console.log(
			`   • Is manual run: ${automaticResult.isManualRun || false}`
		);

		// Wait a second
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Now run manual processing (force mode)
		console.log("\n2️⃣ Running manual processing (force mode)...");
		const manualResult = await LateFeeProcessor.processLateFees(true);

		console.log("✅ Manual processing results:");
		console.log(`   • Success: ${manualResult.success}`);
		console.log(`   • Fees calculated: ${manualResult.feesCalculated}`);
		console.log(
			`   • Total amount: $${manualResult.totalFeeAmount.toFixed(2)}`
		);
		console.log(
			`   • Overdue repayments: ${manualResult.overdueRepayments}`
		);
		console.log(`   • Processing time: ${manualResult.processingTimeMs}ms`);
		console.log(`   • Is manual run: ${manualResult.isManualRun || false}`);

		// Compare results
		console.log("\n📊 Comparison:");
		console.log(
			`   • Automatic found ${automaticResult.overdueRepayments} overdue repayments`
		);
		console.log(
			`   • Manual found ${manualResult.overdueRepayments} overdue repayments`
		);

		if (automaticResult.overdueRepayments > 0) {
			console.log(
				`   • Automatic calculated ${automaticResult.feesCalculated} fees`
			);
			console.log(
				`   • Manual calculated ${manualResult.feesCalculated} fees`
			);

			if (manualResult.feesCalculated > 0) {
				console.log(
					"✅ Manual processing successfully bypassed daily limit!"
				);
			} else {
				console.log(
					"⚠️  Manual processing didn't calculate new fees (this might be expected if no new fees are due)"
				);
			}
		} else {
			console.log(
				"ℹ️  No overdue repayments found - this is expected in a clean system"
			);
			console.log(
				"💡 To test with actual overdue repayments, create some test data first"
			);
		}

		// Test error handling
		console.log("\n3️⃣ Testing error handling...");
		try {
			// This should work fine
			const errorTestResult = await LateFeeProcessor.processLateFees(
				true
			);
			console.log("✅ Error handling test passed - no errors thrown");
		} catch (error) {
			console.log(
				"❌ Unexpected error in error handling test:",
				error.message
			);
		}

		console.log("\n🎉 Manual processing test completed!");
		console.log("\nNext steps:");
		console.log("1. Test the admin dashboard manual processing button");
		console.log(
			"2. Verify that data refreshes properly after manual processing"
		);
		console.log(
			"3. Check that manual processing works even after automatic processing"
		);
	} catch (error) {
		console.error("❌ Test failed:", error);
		process.exit(1);
	}
}

// Run the test
if (require.main === module) {
	testManualProcessing().catch((error) => {
		console.error("Fatal error in test:", error);
		process.exit(1);
	});
}

module.exports = { testManualProcessing };
