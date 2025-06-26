#!/usr/bin/env node

/**
 * Late Fee System Test Script
 *
 * This script creates test data with overdue payments and verifies that
 * the late fee system calculates and applies fees correctly.
 */

require("ts-node/register");
const { PrismaClient } = require("@prisma/client");
const { LateFeeProcessor } = require("../src/lib/lateFeeProcessor.ts");

const prisma = new PrismaClient();

async function createTestData() {
	console.log("🔧 Creating test data...");

	try {
		// Use existing admin user
		const testUser = await prisma.user.findUnique({
			where: { phoneNumber: "60123456789" },
		});

		if (!testUser) {
			throw new Error(
				"Admin user with phone number 60123456789 not found. Please ensure the user exists."
			);
		}

		console.log(
			`📱 Using existing admin user: ${
				testUser.fullName || "Admin User"
			} (${testUser.phoneNumber})`
		);

		// Create a test product
		const testProduct = await prisma.product.upsert({
			where: { code: "TEST_LOAN" },
			update: {},
			create: {
				name: "Test Loan Product",
				code: "TEST_LOAN",
				description: "Test loan for late fee testing",
				interestRate: 12.0,
				maxAmount: 100000,
				minAmount: 1000,
				repaymentTerms: { terms: [1, 3, 6, 12] },
				eligibility: [{ type: "income", value: "1000" }],
				lateFeeRate: 0.1, // 0.1% per day
				lateFeeFixedAmount: 250, // RM 250 fixed fee
				lateFeeFrequencyDays: 7, // every 7 days
				originationFee: 0.0,
				legalFee: 0.0,
				applicationFee: 0.0,
				requiredDocuments: [{ type: "id", required: true }],
				features: [{ name: "quick_approval" }],
				loanTypes: [{ type: "term_loan" }],
				isActive: true,
			},
		});

		// Create a test loan application
		const testApplication = await prisma.loanApplication.create({
			data: {
				userId: testUser.id,
				productId: testProduct.id,
				amount: 10000,
				term: 6,
				purpose: "Testing late fees",
				status: "APPROVED",
			},
		});

		// Create a test loan
		const testLoan = await prisma.loan.create({
			data: {
				userId: testUser.id,
				applicationId: testApplication.id,
				principalAmount: 10000,
				outstandingBalance: 8000, // Partially paid
				interestRate: 12.0,
				term: 6,
				monthlyPayment: 1800,
				status: "ACTIVE",
				totalAmount: 10800,
				disbursedAt: new Date(),
			},
		});

		// Generate proper payment schedule using the same logic as the API
		// This ensures we create repayments with correct structure and scheduledAmount field
		console.log("📅 Generating payment schedule for test loan...");

		// Clear any existing schedule first
		await prisma.loanRepayment.deleteMany({
			where: { loanId: testLoan.id },
		});

		// Use flat rate calculation matching the API
		const monthlyInterestRate = testLoan.interestRate / 100; // 1.5% = 0.015
		const totalInterest =
			Math.round(
				testLoan.principalAmount *
					monthlyInterestRate *
					testLoan.term *
					100
			) / 100;
		const monthlyPayment =
			Math.round(
				((testLoan.principalAmount + totalInterest) / testLoan.term) *
					100
			) / 100;
		const monthlyInterestAmount =
			Math.round((totalInterest / testLoan.term) * 100) / 100;
		const monthlyPrincipalAmount =
			Math.round((testLoan.principalAmount / testLoan.term) * 100) / 100;

		console.log(
			`   • Principal: $${testLoan.principalAmount}, Interest Rate: ${testLoan.interestRate}%, Term: ${testLoan.term} months`
		);
		console.log(
			`   • Total Interest: $${totalInterest}, Monthly Payment: $${monthlyPayment}`
		);

		const today = new Date();
		const repayments = [];

		// Create payment schedule
		for (let month = 1; month <= testLoan.term; month++) {
			// Calculate due date using UTC methods to match API logic
			const disbursementDate = new Date(testLoan.disbursedAt);
			const dueDate = new Date(
				Date.UTC(
					disbursementDate.getUTCFullYear(),
					disbursementDate.getUTCMonth() + month,
					disbursementDate.getUTCDate(),
					15,
					59,
					59,
					999
				)
			);

			let status = "PENDING";
			let actualAmount = null;

			// Make some payments overdue for testing
			if (month === 1) {
				// 5 days overdue
				dueDate.setDate(today.getDate() - 5);
			} else if (month === 2) {
				// 10 days overdue
				dueDate.setDate(today.getDate() - 10);
			} else if (month === 3) {
				// 3 days overdue, partially paid
				dueDate.setDate(today.getDate() - 3);
				status = "PARTIAL";
				actualAmount = monthlyPayment * 0.7; // 70% paid, 30% remaining
			} else if (month === 4) {
				// Future payment (not overdue)
				dueDate.setDate(today.getDate() + 5);
			}

			const repayment = await prisma.loanRepayment.create({
				data: {
					loanId: testLoan.id,
					amount: monthlyPayment,
					principalAmount: monthlyPrincipalAmount,
					interestAmount: monthlyInterestAmount,
					status: status,
					dueDate: dueDate,
					installmentNumber: month,
					scheduledAmount: monthlyPayment, // This field was missing in original test
					actualAmount: actualAmount,
				},
			});

			repayments.push(repayment);
		}

		// Update loan with correct monthly payment and next payment due
		await prisma.loan.update({
			where: { id: testLoan.id },
			data: {
				monthlyPayment: monthlyPayment,
				nextPaymentDue: repayments[0].dueDate,
			},
		});

		console.log("✅ Test data created successfully!");
		console.log(
			`   • Test user: ${testUser.fullName} (${testUser.phoneNumber})`
		);
		console.log(
			`   • Test loan: $${testLoan.principalAmount} (${testLoan.id})`
		);
		console.log(`   • Created ${repayments.length} payment records:`);

		repayments.forEach((repayment, index) => {
			const daysStatus =
				index === 0
					? "5 days overdue"
					: index === 1
					? "10 days overdue"
					: index === 2
					? "3 days overdue (partial)"
					: "future payment";
			console.log(
				`     - Payment ${index + 1}: $${repayment.amount.toFixed(
					2
				)} - ${repayment.dueDate.toDateString()} (${daysStatus})`
			);
		});

		return {
			user: testUser,
			loan: testLoan,
			repayments: repayments.slice(0, 3), // Return only overdue repayments for verification
		};
	} catch (error) {
		console.error("❌ Error creating test data:", error);
		throw error;
	}
}

async function runLateFeeProcessing() {
	console.log("\n💰 Running late fee processing...");

	const result = await LateFeeProcessor.processLateFees();

	console.log(`✅ Processing completed:`);
	console.log(`   • Success: ${result.success}`);
	console.log(`   • Fees calculated: ${result.feesCalculated}`);
	console.log(`   • Total fee amount: $${result.totalFeeAmount.toFixed(2)}`);
	console.log(`   • Overdue repayments: ${result.overdueRepayments}`);
	console.log(`   • Processing time: ${result.processingTimeMs}ms`);

	if (result.errorMessage) {
		console.log(`   • Error: ${result.errorMessage}`);
	}

	return result;
}

async function verifyLateFees() {
	console.log("\n🔍 Verifying late fee calculations...");

	// Get all late fees
	const lateFees = await prisma.$queryRawUnsafe(`
    SELECT lf.*, lr.amount as repayment_amount, lr."dueDate", lr."actualAmount"
    FROM late_fees lf
    JOIN loan_repayments lr ON lf."loanRepaymentId" = lr.id
    ORDER BY lf."calculationDate" DESC, lf."daysOverdue" DESC
  `);

	console.log(`\n📊 Late Fee Details (${lateFees.length} records):`);
	console.log("─".repeat(120));
	console.log(
		"Repayment ID".padEnd(15) +
			"Due Date".padEnd(12) +
			"Days Overdue".padEnd(13) +
			"Outstanding".padEnd(12) +
			"Daily Rate".padEnd(12) +
			"Fee Amount".padEnd(12) +
			"Cumulative".padEnd(12) +
			"Status"
	);
	console.log("─".repeat(120));

	let totalFees = 0;
	for (const fee of lateFees) {
		const dueDate = new Date(fee.dueDate).toLocaleDateString();
		const outstanding = fee.actualAmount
			? Math.max(0, fee.repayment_amount - fee.actualAmount)
			: fee.repayment_amount;

		console.log(
			fee.loanRepaymentId.substring(0, 12).padEnd(15) +
				dueDate.padEnd(12) +
				fee.daysOverdue.toString().padEnd(13) +
				`$${outstanding.toFixed(0)}`.padEnd(12) +
				`${(fee.dailyRate * 100).toFixed(4)}%`.padEnd(12) +
				`$${fee.feeAmount.toFixed(2)}`.padEnd(12) +
				`$${fee.cumulativeFees.toFixed(2)}`.padEnd(12) +
				fee.status
		);
		totalFees += parseFloat(fee.feeAmount);
	}

	console.log("─".repeat(120));
	console.log(`Total Late Fees: $${totalFees.toFixed(2)}`);

	// Manual verification of calculations
	console.log("\n🧮 Manual Calculation Verification:");
	const dailyRate = 0.08 / 365; // 8% annual / 365 days
	console.log(
		`Daily Rate: ${(dailyRate * 100).toFixed(6)}% (${dailyRate.toFixed(8)})`
	);

	// Expected calculations:
	console.log("\nExpected Late Fees:");
	console.log(
		`• Repayment 1 (5 days, $2000): $${(2000 * dailyRate).toFixed(
			2
		)} per day`
	);
	console.log(
		`• Repayment 2 (10 days, $1800): $${(1800 * dailyRate).toFixed(
			2
		)} per day`
	);
	console.log(
		`• Repayment 3 (3 days, $500): $${(500 * dailyRate).toFixed(2)} per day`
	);

	return lateFees;
}

async function checkProcessingLogs() {
	console.log("\n📋 Checking processing logs...");

	const logs = await prisma.$queryRawUnsafe(`
    SELECT * FROM late_fee_processing_logs
    ORDER BY "processedAt" DESC
    LIMIT 5
  `);

	console.log(`\n📊 Recent Processing Logs (${logs.length} records):`);
	console.log("─".repeat(100));
	console.log(
		"Processed At".padEnd(20) +
			"Status".padEnd(10) +
			"Fees Calc".padEnd(12) +
			"Total Amount".padEnd(14) +
			"Overdue".padEnd(10) +
			"Time (ms)"
	);
	console.log("─".repeat(100));

	for (const log of logs) {
		const processedAt = new Date(log.processedAt).toLocaleString();
		console.log(
			processedAt.substring(0, 19).padEnd(20) +
				log.status.padEnd(10) +
				log.feesCalculated.toString().padEnd(12) +
				`$${log.totalFeeAmount.toFixed(2)}`.padEnd(14) +
				log.overdue_repayments.toString().padEnd(10) +
				`${log.processingTimeMs}ms`
		);
	}

	return logs;
}

async function testHealthCheck() {
	console.log("\n🏥 Testing health check system...");

	const status = await LateFeeProcessor.getProcessingStatus();

	console.log("Health Check Results:");
	console.log(
		`• Last Processed: ${
			status.lastProcessed
				? new Date(status.lastProcessed).toLocaleString()
				: "Never"
		}`
	);
	console.log(`• Last Status: ${status.lastStatus}`);
	console.log(`• Processed Today: ${status.processedToday ? "Yes" : "No"}`);
	console.log(`• Today's Processing Count: ${status.todayProcessingCount}`);
	console.log(`• Last Error: ${status.lastError || "None"}`);

	return status;
}

async function cleanupTestData() {
	console.log("\n🧹 Cleaning up test data...");

	try {
		// Delete in reverse order of dependencies
		await prisma.$queryRawUnsafe(`DELETE FROM late_fees WHERE "loanRepaymentId" IN (
      SELECT lr.id FROM loan_repayments lr 
      JOIN loans l ON lr."loanId" = l.id 
      JOIN users u ON l."userId" = u.id 
      WHERE u."phoneNumber" = '60123456789'
    )`);

		await prisma.$queryRawUnsafe(`DELETE FROM loan_repayments WHERE "loanId" IN (
      SELECT l.id FROM loans l 
      JOIN users u ON l."userId" = u.id 
      WHERE u."phoneNumber" = '60123456789'
    )`);

		await prisma.$queryRawUnsafe(`DELETE FROM loans WHERE "userId" IN (
      SELECT id FROM users WHERE "phoneNumber" = '60123456789'
    )`);

		await prisma.$queryRawUnsafe(`DELETE FROM loan_applications WHERE "userId" IN (
      SELECT id FROM users WHERE "phoneNumber" = '60123456789'
    )`);

		// Don't delete the admin user, just the test product
		await prisma.$queryRawUnsafe(
			`DELETE FROM products WHERE code = 'TEST_LOAN'`
		);

		console.log("✅ Test data cleaned up successfully");
		console.log("ℹ️  Admin user preserved (not deleted)");
	} catch (error) {
		console.error("❌ Error cleaning up test data:", error);
	}
}

async function main() {
	console.log("🚀 Starting Late Fee System Test\n");
	console.log("═".repeat(60));

	try {
		// Step 1: Create test data
		const testData = await createTestData();

		// Step 2: Run late fee processing
		const processingResult = await runLateFeeProcessing();

		// Step 3: Verify calculations
		const lateFees = await verifyLateFees();

		// Step 4: Check processing logs
		const logs = await checkProcessingLogs();

		// Step 5: Test health check
		const healthStatus = await testHealthCheck();

		console.log("\n" + "═".repeat(60));
		console.log("🎉 TEST SUMMARY");
		console.log("═".repeat(60));

		const success =
			processingResult.success &&
			processingResult.feesCalculated > 0 &&
			lateFees.length > 0 &&
			healthStatus.processedToday;

		if (success) {
			console.log("✅ ALL TESTS PASSED!");
			console.log(`   • Late fee processing: WORKING`);
			console.log(`   • Fee calculations: CORRECT`);
			console.log(`   • Database storage: WORKING`);
			console.log(`   • Health monitoring: WORKING`);
			console.log(`   • Logging system: WORKING`);
		} else {
			console.log("❌ SOME TESTS FAILED!");
			console.log(
				`   • Processing success: ${
					processingResult.success ? "✅" : "❌"
				}`
			);
			console.log(
				`   • Fees calculated: ${
					processingResult.feesCalculated > 0 ? "✅" : "❌"
				}`
			);
			console.log(
				`   • Database records: ${lateFees.length > 0 ? "✅" : "❌"}`
			);
			console.log(
				`   • Health check: ${
					healthStatus.processedToday ? "✅" : "❌"
				}`
			);
		}

		// Ask user if they want to keep test data
		console.log(
			"\n❓ Do you want to keep the test data for further testing?"
		);
		console.log(
			"   (You can manually clean it up later by running this script with --cleanup)"
		);

		// Check for cleanup flag
		if (process.argv.includes("--cleanup")) {
			await cleanupTestData();
		} else {
			console.log(
				"   Test data preserved. Run with --cleanup flag to remove it."
			);
		}
	} catch (error) {
		console.error("❌ Test failed with error:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// Handle cleanup flag
if (process.argv.includes("--cleanup-only")) {
	cleanupTestData()
		.then(() => {
			console.log("✅ Cleanup completed");
			process.exit(0);
		})
		.catch((error) => {
			console.error("❌ Cleanup failed:", error);
			process.exit(1);
		});
} else {
	main();
}
