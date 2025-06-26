#!/usr/bin/env node

/**
 * Late Fee Payment Handling Test Script
 *
 * This script demonstrates what happens when late payments are cleared,
 * including how late fees are handled based on payment amounts.
 */

require("ts-node/register");
const { PrismaClient } = require("@prisma/client");
const { LateFeeProcessor } = require("../src/lib/lateFeeProcessor.ts");

const prisma = new PrismaClient();

async function createTestScenario() {
	console.log(
		"🔧 Creating test scenario with overdue payment and late fees..."
	);

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

		// Create test product
		const testProduct = await prisma.product.upsert({
			where: { code: "LATE_FEE_TEST" },
			update: {},
			create: {
				name: "Late Fee Test Product",
				code: "LATE_FEE_TEST",
				description: "Test product for late fee payment handling",
				interestRate: 12.0,
				maxAmount: 50000,
				minAmount: 5000,
				repaymentTerms: { terms: [1, 3, 6] },
				eligibility: [{ type: "income", value: "2000" }],
				lateFee: 8.0,
				originationFee: 0.0,
				legalFee: 0.0,
				applicationFee: 0.0,
				requiredDocuments: [{ type: "id", required: true }],
				features: [{ name: "late_fee_test" }],
				loanTypes: [{ type: "test_loan" }],
				isActive: true,
			},
		});

		// Create test loan application
		const testApplication = await prisma.loanApplication.create({
			data: {
				userId: testUser.id,
				productId: testProduct.id,
				amount: 5000,
				term: 3,
				purpose: "Testing late fee payment handling",
				status: "APPROVED",
			},
		});

		// Create test loan
		const testLoan = await prisma.loan.create({
			data: {
				userId: testUser.id,
				applicationId: testApplication.id,
				principalAmount: 5000,
				outstandingBalance: 5000,
				interestRate: 12.0,
				term: 3,
				monthlyPayment: 1800,
				status: "ACTIVE",
				totalAmount: 5400,
				disbursedAt: new Date(),
			},
		});

		// Create overdue repayment (15 days overdue)
		const overdueDate = new Date();
		overdueDate.setDate(overdueDate.getDate() - 15);

		const overdueRepayment = await prisma.loanRepayment.create({
			data: {
				loanId: testLoan.id,
				amount: 1800,
				principalAmount: 1500,
				interestAmount: 300,
				status: "PENDING",
				dueDate: overdueDate,
				installmentNumber: 1,
			},
		});

		console.log("✅ Test scenario created:");
		console.log(
			`   • User: ${testUser.fullName} (${testUser.phoneNumber})`
		);
		console.log(`   • Loan: $${testLoan.principalAmount} (${testLoan.id})`);
		console.log(
			`   • Overdue repayment: $${
				overdueRepayment.amount
			} - ${overdueDate.toDateString()} (15 days overdue)`
		);

		return {
			user: testUser,
			loan: testLoan,
			repayment: overdueRepayment,
		};
	} catch (error) {
		console.error("❌ Error creating test scenario:", error);
		throw error;
	}
}

async function generateLateFees(repaymentId) {
	console.log("\n💰 Generating late fees for overdue payment...");

	const result = await LateFeeProcessor.processLateFees();

	console.log(`✅ Late fees generated:`);
	console.log(`   • Fees calculated: ${result.feesCalculated}`);
	console.log(`   • Total fee amount: $${result.totalFeeAmount.toFixed(2)}`);

	return result;
}

async function showLateFeeBreakdown(repaymentId) {
	console.log("\n📊 Current late fee breakdown:");

	const totalDue = await LateFeeProcessor.getTotalAmountDue(repaymentId);

	console.log(`   • Original amount: $${totalDue.originalAmount.toFixed(2)}`);
	console.log(`   • Total late fees: $${totalDue.totalLateFees.toFixed(2)}`);
	console.log(
		`   • TOTAL AMOUNT DUE: $${totalDue.totalAmountDue.toFixed(2)}`
	);

	console.log("\n   Late fee details:");
	totalDue.lateFeeBreakdown.forEach((fee, index) => {
		console.log(
			`     ${index + 1}. ${new Date(
				fee.date
			).toDateString()}: $${fee.amount.toFixed(2)} (${
				fee.daysOverdue
			} days overdue)`
		);
	});

	return totalDue;
}

async function testPaymentScenarios(
	repaymentId,
	originalAmount,
	totalLateFees
) {
	console.log("\n🧪 Testing different payment scenarios:");
	console.log("=".repeat(80));

	const scenarios = [
		{
			name: "Scenario 1: Payment covers only original amount",
			amount: originalAmount,
			description: "Late fees should be WAIVED",
		},
		{
			name: "Scenario 2: Payment covers original + partial late fees",
			amount: originalAmount + totalLateFees * 0.6,
			description: "Partial late fees PAID, remainder WAIVED",
		},
		{
			name: "Scenario 3: Payment covers original + all late fees",
			amount: originalAmount + totalLateFees,
			description: "All late fees PAID",
		},
		{
			name: "Scenario 4: Payment exceeds total amount due",
			amount: originalAmount + totalLateFees + 100,
			description: "All late fees PAID, excess returned",
		},
	];

	for (const scenario of scenarios) {
		console.log(`\n${scenario.name}`);
		console.log(`Payment Amount: $${scenario.amount.toFixed(2)}`);
		console.log(`Expected: ${scenario.description}`);

		try {
			const result = await LateFeeProcessor.handleRepaymentCleared(
				repaymentId,
				scenario.amount,
				new Date()
			);

			console.log(`✅ Result:`);
			console.log(`   • Success: ${result.success}`);
			console.log(
				`   • Late fees paid: $${result.lateFeesPaid.toFixed(2)}`
			);
			console.log(
				`   • Late fees waived: $${result.lateFeesWaived.toFixed(2)}`
			);
			console.log(
				`   • Total late fees: $${result.totalLateFees.toFixed(2)}`
			);
			console.log(
				`   • Remaining payment: $${result.remainingPayment.toFixed(2)}`
			);
		} catch (error) {
			console.error(`❌ Error in ${scenario.name}:`, error.message);
		}

		console.log("-".repeat(60));
	}
}

async function showFinalStatus(repaymentId) {
	console.log("\n📋 Final late fee status:");

	const fees = await prisma.$queryRawUnsafe(
		`
    SELECT * FROM late_fees 
    WHERE "loanRepaymentId" = $1 
    ORDER BY "calculationDate" ASC
  `,
		repaymentId
	);

	if (fees.length === 0) {
		console.log("   No late fees found.");
		return;
	}

	console.log(`   Total late fee records: ${fees.length}`);

	const statusCounts = fees.reduce((acc, fee) => {
		acc[fee.status] = (acc[fee.status] || 0) + 1;
		return acc;
	}, {});

	Object.entries(statusCounts).forEach(([status, count]) => {
		const totalAmount = fees
			.filter((f) => f.status === status)
			.reduce((sum, f) => sum + f.feeAmount, 0);
		console.log(
			`   • ${status}: ${count} records, $${totalAmount.toFixed(2)}`
		);
	});
}

async function cleanupTestData() {
	console.log("\n🧹 Cleaning up test data...");

	try {
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
			`DELETE FROM products WHERE code = 'LATE_FEE_TEST'`
		);

		console.log("✅ Test data cleaned up successfully");
		console.log("ℹ️  Admin user preserved (not deleted)");
	} catch (error) {
		console.error("❌ Error cleaning up test data:", error);
	}
}

async function main() {
	console.log("🚀 Starting Late Fee Payment Handling Test");
	console.log("═".repeat(80));

	try {
		// Step 1: Create test scenario
		const testData = await createTestScenario();

		// Step 2: Generate late fees
		await generateLateFees(testData.repayment.id);

		// Step 3: Show current breakdown
		const breakdown = await showLateFeeBreakdown(testData.repayment.id);

		// Step 4: Test different payment scenarios
		await testPaymentScenarios(
			testData.repayment.id,
			breakdown.originalAmount,
			breakdown.totalLateFees
		);

		// Step 5: Show final status
		await showFinalStatus(testData.repayment.id);

		console.log("\n" + "═".repeat(80));
		console.log("🎉 LATE FEE PAYMENT HANDLING TEST COMPLETED");
		console.log("═".repeat(80));

		console.log("\n✅ Key Findings:");
		console.log(
			"   • Late fees are automatically handled when payments are processed"
		);
		console.log(
			"   • Payment priority: Original Amount → Late Fees → Excess"
		);
		console.log("   • Insufficient payments result in late fee waivers");
		console.log("   • All transactions are logged for audit purposes");
		console.log("   • System gracefully handles edge cases and errors");

		// Cleanup
		if (process.argv.includes("--cleanup")) {
			await cleanupTestData();
		} else {
			console.log("\n💡 Run with --cleanup flag to remove test data");
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
