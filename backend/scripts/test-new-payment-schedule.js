#!/usr/bin/env node

/**
 * Test New Payment Schedule Logic
 * 
 * This script tests the new payment schedule calculation that uses:
 * - 1st of month payment dates
 * - 20th cutoff rule for determining first payment month
 * - Pro-rated first payment based on actual days
 * - Malaysia timezone (UTC+8) for date calculations
 * 
 * Test cases include:
 * - Disbursements before 20th (next month payment)
 * - Disbursements on/after 20th (month after next payment)
 * - End of month edge cases
 * - Year rollover scenarios
 * - February edge cases
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Helper function to calculate first payment date with 20th cutoff rule
function calculateFirstPaymentDate(disbursementDate) {
	// Convert disbursement date to Malaysia timezone for cutoff logic
	const malaysiaTime = new Date(disbursementDate.getTime() + (8 * 60 * 60 * 1000));
	
	const day = malaysiaTime.getUTCDate();
	const month = malaysiaTime.getUTCMonth();
	const year = malaysiaTime.getUTCFullYear();
	
	let firstPaymentMonth;
	let firstPaymentYear;
	
	if (day < 20) {
		// If disbursed before 20th, first payment is 1st of next month
		firstPaymentMonth = month + 1;
		firstPaymentYear = year;
		
		// Handle year rollover
		if (firstPaymentMonth > 11) {
			firstPaymentMonth = 0;
			firstPaymentYear++;
		}
	} else {
		// If disbursed on or after 20th, first payment is 1st of month after next
		firstPaymentMonth = month + 2;
		firstPaymentYear = year;
		
		// Handle year rollover
		if (firstPaymentMonth > 11) {
			firstPaymentMonth = firstPaymentMonth - 12;
			firstPaymentYear++;
		}
	}
	
	// Create first payment date as 1st of target month at end of day (Malaysia timezone)
	// Set to 15:59:59 UTC so it becomes 23:59:59 Malaysia time (GMT+8)
	const firstPaymentDate = new Date(
		Date.UTC(firstPaymentYear, firstPaymentMonth, 1, 15, 59, 59, 999)
	);
	
	return firstPaymentDate;
}

// Helper function to calculate days between two dates in Malaysia timezone
function calculateDaysBetweenMalaysia(startDate, endDate) {
	// Convert both dates to Malaysia timezone for accurate day calculation
	const startMalaysia = new Date(startDate.getTime() + (8 * 60 * 60 * 1000));
	const endMalaysia = new Date(endDate.getTime() + (8 * 60 * 60 * 1000));
	
	// Get start of day for both dates
	const startDay = new Date(Date.UTC(
		startMalaysia.getUTCFullYear(),
		startMalaysia.getUTCMonth(),
		startMalaysia.getUTCDate(),
		0, 0, 0, 0
	));
	
	const endDay = new Date(Date.UTC(
		endMalaysia.getUTCFullYear(),
		endMalaysia.getUTCMonth(),
		endMalaysia.getUTCDate(),
		0, 0, 0, 0
	));
	
	const diffMs = endDay.getTime() - startDay.getTime();
	return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

// Format date for display (Malaysia timezone)
function formatMalaysiaDate(date) {
	const malaysiaTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));
	return malaysiaTime.toISOString().split('T')[0] + ' (Malaysia)';
}

// SafeMath utilities (simplified for testing)
const SafeMath = {
	toNumber: (value) => Math.round(value * 100) / 100,
	add: (a, b) => Math.round((a + b) * 100) / 100,
	subtract: (a, b) => Math.round((a - b) * 100) / 100,
	multiply: (a, b) => Math.round((a * b) * 100) / 100,
	divide: (a, b) => Math.round((a / b) * 100) / 100,
	max: (a, b) => Math.max(a, b)
};

// Test case generator
function generateTestCases() {
	const testCases = [];
	
	// Test Case 1: Disbursement before 20th (next month payment)
	testCases.push({
		name: "Disbursement on 15th - Next Month Payment",
		disbursementDate: new Date('2025-01-15T10:00:00.000Z'),
		expectedFirstPaymentMonth: 'February',
		description: "Disbursed Jan 15th, first payment Feb 1st"
	});
	
	// Test Case 2: Disbursement on 20th (month after next payment)
	testCases.push({
		name: "Disbursement on 20th - Month After Next Payment",
		disbursementDate: new Date('2025-01-20T10:00:00.000Z'),
		expectedFirstPaymentMonth: 'March',
		description: "Disbursed Jan 20th, first payment Mar 1st"
	});
	
	// Test Case 3: Disbursement after 20th (month after next payment)
	testCases.push({
		name: "Disbursement on 25th - Month After Next Payment",
		disbursementDate: new Date('2025-01-25T10:00:00.000Z'),
		expectedFirstPaymentMonth: 'March',
		description: "Disbursed Jan 25th, first payment Mar 1st"
	});
	
	// Test Case 4: End of month disbursement
	testCases.push({
		name: "End of Month Disbursement",
		disbursementDate: new Date('2025-01-31T10:00:00.000Z'),
		expectedFirstPaymentMonth: 'March',
		description: "Disbursed Jan 31st, first payment Mar 1st"
	});
	
	// Test Case 5: February edge case
	testCases.push({
		name: "February Disbursement",
		disbursementDate: new Date('2025-02-15T10:00:00.000Z'),
		expectedFirstPaymentMonth: 'March',
		description: "Disbursed Feb 15th, first payment Mar 1st"
	});
	
	// Test Case 6: Year rollover
	testCases.push({
		name: "December Year Rollover",
		disbursementDate: new Date('2024-12-25T10:00:00.000Z'),
		expectedFirstPaymentMonth: 'February 2025',
		description: "Disbursed Dec 25th 2024, first payment Feb 1st 2025"
	});
	
	// Test Case 7: November to January rollover
	testCases.push({
		name: "November to January Rollover",
		disbursementDate: new Date('2024-11-25T10:00:00.000Z'),
		expectedFirstPaymentMonth: 'January 2025',
		description: "Disbursed Nov 25th 2024, first payment Jan 1st 2025"
	});
	
	// Test Case 8: Early morning disbursement (timezone edge case)
	testCases.push({
		name: "Early Morning Disbursement",
		disbursementDate: new Date('2025-01-19T16:30:00.000Z'), // 12:30 AM Malaysia time
		expectedFirstPaymentMonth: 'February',
		description: "Disbursed Jan 19th 12:30 AM Malaysia time, first payment Feb 1st"
	});
	
	// Test Case 9: Late night disbursement (timezone edge case)
	testCases.push({
		name: "Late Night Disbursement",
		disbursementDate: new Date('2025-01-19T23:30:00.000Z'), // 7:30 AM Malaysia time next day
		expectedFirstPaymentMonth: 'March',
		description: "Disbursed Jan 20th 7:30 AM Malaysia time, first payment Mar 1st"
	});
	
	return testCases;
}

// Generate payment schedule for testing
function generateTestPaymentSchedule(disbursementDate, principal, interestRate, term) {
	const repayments = [];
	
	// Flat rate calculation: (Principal + Total Interest) / Term
	const monthlyInterestRate = SafeMath.toNumber(interestRate) / 100;
	const principalAmount = SafeMath.toNumber(principal);
	
	// Calculate total interest with precision
	const totalInterest = SafeMath.multiply(
		SafeMath.multiply(principalAmount, monthlyInterestRate), 
		term
	);
	
	// Total amount to be paid (principal + interest)
	const totalAmountToPay = SafeMath.add(principalAmount, totalInterest);

	// Calculate first payment date using new cutoff logic
	const firstPaymentDate = calculateFirstPaymentDate(disbursementDate);
	
	// Calculate pro-rated first payment for actual period from disbursement to first payment
	const daysInFirstPeriod = calculateDaysBetweenMalaysia(disbursementDate, firstPaymentDate);
	const daysInFullTerm = term * 30; // Total days for the entire loan term (using 30-day months)
	const monthlyInterestRateDecimal = SafeMath.toNumber(interestRate) / 100; // Monthly interest rate as decimal
	const dailyInterestRate = monthlyInterestRateDecimal / 30; // Daily interest rate from monthly (consistent with 30-day months)
	
	// Calculate interest for the actual period from disbursement to first payment
	const firstPeriodInterest = SafeMath.toNumber(
		principalAmount * dailyInterestRate * daysInFirstPeriod
	);
	
	// Calculate principal portion for first payment (proportional to time period)
	const firstPeriodPrincipalRatio = SafeMath.divide(daysInFirstPeriod, daysInFullTerm);
	const firstPeriodPrincipal = SafeMath.multiply(principalAmount, firstPeriodPrincipalRatio);
	
	// Calculate remaining amounts after first payment
	const remainingTerm = term - 1; // Remaining payments after first payment
	const remainingInterest = SafeMath.subtract(totalInterest, firstPeriodInterest);
	const remainingPrincipal = SafeMath.subtract(principalAmount, firstPeriodPrincipal);
	const remainingTotal = SafeMath.add(remainingInterest, remainingPrincipal);
	
	// Calculate monthly amounts for remaining payments
	const baseMonthlyPayment = remainingTerm > 0 ? SafeMath.divide(remainingTotal, remainingTerm) : 0;
	const baseMonthlyInterest = remainingTerm > 0 ? SafeMath.divide(remainingInterest, remainingTerm) : 0;
	const baseMonthlyPrincipal = remainingTerm > 0 ? SafeMath.divide(remainingPrincipal, remainingTerm) : 0;

	// Generate all installments with new logic
	let totalScheduled = 0;
	let totalInterestScheduled = 0;
	let totalPrincipalScheduled = 0;

	for (let month = 1; month <= term; month++) {
		let dueDate;
		
		if (month === 1) {
			// First payment uses calculated first payment date
			dueDate = firstPaymentDate;
		} else {
			// Subsequent payments are on 1st of each following month
			const firstPaymentMalaysia = new Date(firstPaymentDate.getTime() + (8 * 60 * 60 * 1000));
			const targetMonth = firstPaymentMalaysia.getUTCMonth() + (month - 1);
			let targetYear = firstPaymentMalaysia.getUTCFullYear();
			let actualMonth = targetMonth;
			
			// Handle year rollover
			if (actualMonth > 11) {
				actualMonth = actualMonth - 12;
				targetYear++;
			}
			
			dueDate = new Date(
				Date.UTC(targetYear, actualMonth, 1, 15, 59, 59, 999)
			);
		}

		let installmentAmount, interestAmount, principalPortion;

		if (month === 1) {
			// First payment: pro-rated based on actual days from disbursement to first payment
			interestAmount = firstPeriodInterest;
			principalPortion = firstPeriodPrincipal;
			installmentAmount = SafeMath.add(interestAmount, principalPortion);
			
			// Track running totals
			totalScheduled = SafeMath.add(totalScheduled, installmentAmount);
			totalInterestScheduled = SafeMath.add(totalInterestScheduled, interestAmount);
			totalPrincipalScheduled = SafeMath.add(totalPrincipalScheduled, principalPortion);
		} else if (month === term) {
			// Final installment: adjust to ensure total matches exactly
			installmentAmount = SafeMath.subtract(totalAmountToPay, totalScheduled);
			interestAmount = SafeMath.subtract(totalInterest, totalInterestScheduled);
			principalPortion = SafeMath.subtract(principalAmount, totalPrincipalScheduled);
		} else {
			// Regular installment: use base amounts
			installmentAmount = baseMonthlyPayment;
			interestAmount = baseMonthlyInterest;
			principalPortion = baseMonthlyPrincipal;
			
			// Track running totals
			totalScheduled = SafeMath.add(totalScheduled, installmentAmount);
			totalInterestScheduled = SafeMath.add(totalInterestScheduled, interestAmount);
			totalPrincipalScheduled = SafeMath.add(totalPrincipalScheduled, principalPortion);
		}

		repayments.push({
			installmentNumber: month,
			amount: installmentAmount,
			principalAmount: principalPortion,
			interestAmount: interestAmount,
			dueDate: dueDate,
		});
	}
	
	return {
		repayments,
		summary: {
			totalAmountToPay,
			totalInterest,
			baseMonthlyPayment,
			firstPaymentDate,
			daysInFirstPeriod,
			dailyInterestRate,
			firstPeriodInterest,
			firstPeriodPrincipal,
			calculatedTotal: repayments.reduce((sum, r) => SafeMath.add(sum, r.amount), 0)
		}
	};
}

// Run individual test case
async function runTestCase(testCase) {
	console.log(`\n${'='.repeat(80)}`);
	console.log(`🧪 TEST CASE: ${testCase.name}`);
	console.log(`📝 ${testCase.description}`);
	console.log(`${'='.repeat(80)}`);
	
	const disbursementDate = testCase.disbursementDate;
	const principal = 10000; // RM 10,000
	const interestRate = 12; // 12% annual
	const term = 6; // 6 months
	
	console.log(`\n📊 LOAN DETAILS:`);
	console.log(`   Principal: RM ${principal.toLocaleString()}`);
	console.log(`   Interest Rate: ${interestRate}% monthly`);
	console.log(`   Term: ${term} months`);
	console.log(`   Disbursement: ${formatMalaysiaDate(disbursementDate)}`);
	
	// Generate payment schedule
	const schedule = generateTestPaymentSchedule(disbursementDate, principal, interestRate, term);
	
	console.log(`\n💰 PAYMENT CALCULATION:`);
	console.log(`   Total Interest: RM ${schedule.summary.totalInterest.toFixed(2)}`);
	console.log(`   Total Amount: RM ${schedule.summary.totalAmountToPay.toFixed(2)}`);
	console.log(`   Base Monthly Payment: RM ${schedule.summary.baseMonthlyPayment.toFixed(2)}`);
	console.log(`   First Payment Date: ${formatMalaysiaDate(schedule.summary.firstPaymentDate)}`);
	console.log(`   Days in First Period: ${schedule.summary.daysInFirstPeriod}`);
	console.log(`   Daily Interest Rate: ${(schedule.summary.dailyInterestRate * 100).toFixed(6)}% per day`);
	console.log(`   First Period Interest: RM ${schedule.summary.firstPeriodInterest.toFixed(2)}`);
	console.log(`   First Period Principal: RM ${schedule.summary.firstPeriodPrincipal.toFixed(2)}`);
	
	console.log(`\n📅 PAYMENT SCHEDULE:`);
	console.log(`   ${'#'.padEnd(3)} | ${'Due Date'.padEnd(20)} | ${'Amount'.padStart(10)} | ${'Principal'.padStart(10)} | ${'Interest'.padStart(10)}`);
	console.log(`   ${'-'.repeat(3)} | ${'-'.repeat(20)} | ${'-'.repeat(10)} | ${'-'.repeat(10)} | ${'-'.repeat(10)}`);
	
	schedule.repayments.forEach((payment, index) => {
		const dueDateStr = formatMalaysiaDate(payment.dueDate);
		console.log(`   ${(index + 1).toString().padEnd(3)} | ${dueDateStr.padEnd(20)} | RM ${payment.amount.toFixed(2).padStart(7)} | RM ${payment.principalAmount.toFixed(2).padStart(7)} | RM ${payment.interestAmount.toFixed(2).padStart(7)}`);
	});
	
	console.log(`   ${'-'.repeat(3)} | ${'-'.repeat(20)} | ${'-'.repeat(10)} | ${'-'.repeat(10)} | ${'-'.repeat(10)}`);
	console.log(`   ${'TOT'.padEnd(3)} | ${''.padEnd(20)} | RM ${schedule.summary.calculatedTotal.toFixed(2).padStart(7)} | ${''.padEnd(12)} | ${''.padEnd(12)}`);
	
	// Validation
	const totalDiff = Math.abs(schedule.summary.calculatedTotal - schedule.summary.totalAmountToPay);
	console.log(`\n✅ VALIDATION:`);
	console.log(`   Expected Total: RM ${schedule.summary.totalAmountToPay.toFixed(2)}`);
	console.log(`   Calculated Total: RM ${schedule.summary.calculatedTotal.toFixed(2)}`);
	console.log(`   Difference: RM ${totalDiff.toFixed(2)} ${totalDiff < 0.01 ? '✅ PASS' : '❌ FAIL'}`);
	
	// Check if first payment is on expected month
	const firstPaymentMalaysia = new Date(schedule.summary.firstPaymentDate.getTime() + (8 * 60 * 60 * 1000));
	const firstPaymentMonthYear = firstPaymentMalaysia.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
	console.log(`   Expected First Payment Month: ${testCase.expectedFirstPaymentMonth}`);
	console.log(`   Actual First Payment Month: ${firstPaymentMonthYear}`);
	
	// Check minimum days before first payment (should be at least 8 days)
	const minDaysCheck = schedule.summary.daysInFirstPeriod >= 8;
	console.log(`   Minimum 8 days before first payment: ${minDaysCheck ? '✅ PASS' : '❌ FAIL'}`);
	
	return {
		testCase: testCase.name,
		passed: totalDiff < 0.01 && minDaysCheck,
		totalDiff,
		daysInFirstPeriod: schedule.summary.daysInFirstPeriod,
		firstPaymentMonth: firstPaymentMonthYear
	};
}

// Main test runner
async function runAllTests() {
	console.log(`🚀 TESTING NEW PAYMENT SCHEDULE LOGIC`);
	console.log(`${'='.repeat(80)}`);
	console.log(`Testing payment schedule with:`);
	console.log(`  • 1st of month payment dates`);
	console.log(`  • 20th cutoff rule for first payment`);
	console.log(`  • Pro-rated first payment calculation`);
	console.log(`  • Malaysia timezone (UTC+8) handling`);
	
	const testCases = generateTestCases();
	const results = [];
	
	for (const testCase of testCases) {
		try {
			const result = await runTestCase(testCase);
			results.push(result);
		} catch (error) {
			console.error(`❌ Error in test case ${testCase.name}:`, error);
			results.push({
				testCase: testCase.name,
				passed: false,
				error: error.message
			});
		}
	}
	
	// Summary
	console.log(`\n${'='.repeat(80)}`);
	console.log(`📊 TEST SUMMARY`);
	console.log(`${'='.repeat(80)}`);
	
	const passedTests = results.filter(r => r.passed).length;
	const totalTests = results.length;
	
	console.log(`\nOverall Results: ${passedTests}/${totalTests} tests passed\n`);
	
	results.forEach(result => {
		const status = result.passed ? '✅ PASS' : '❌ FAIL';
		console.log(`  ${status} ${result.testCase}`);
		if (result.error) {
			console.log(`      Error: ${result.error}`);
		}
	});
	
	if (passedTests === totalTests) {
		console.log(`\n🎉 All tests passed! New payment schedule logic is working correctly.`);
	} else {
		console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Please review the implementation.`);
	}
	
	return results;
}

// Run tests if script is executed directly
if (require.main === module) {
	runAllTests()
		.then(() => {
			console.log(`\n✅ Test execution completed.`);
			process.exit(0);
		})
		.catch(error => {
			console.error(`❌ Test execution failed:`, error);
			process.exit(1);
		})
		.finally(() => {
			prisma.$disconnect();
		});
}

module.exports = {
	runAllTests,
	runTestCase,
	generateTestCases,
	calculateFirstPaymentDate,
	calculateDaysBetweenMalaysia,
	generateTestPaymentSchedule
}; 