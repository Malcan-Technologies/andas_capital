import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	// Check if users table is empty
	const userCount = await prisma.user.count();
	if (userCount === 0) {
		console.log("Creating admin user...");
		// Create admin user
		const hashedPassword = await bcrypt.hash("admin123", 10);
		await prisma.user.create({
			data: {
				phoneNumber: "+60182440976", // Example admin phone
				password: hashedPassword,
				fullName: "System Administrator",
				email: "admin@kredit.my",
				role: "ADMIN",
				isOnboardingComplete: true,
				kycStatus: true,
			},
		});
		console.log("Admin user created successfully");
	} else {
		console.log("Users table is not empty, skipping admin user creation");
	}

	// Check if products table is empty
	const productCount = await prisma.product.count();
	if (productCount === 0) {
		console.log("Creating products...");
		// Create products
		await prisma.product.createMany({
			data: [
				{
					code: "payadvance",
					name: "PayAdvance™",
					description:
						"Get up to 50% of your monthly salary in advance. Quick approval, no collateral needed.",
					minAmount: 1000,
					maxAmount: 20000,
					repaymentTerms: [6, 12], // 1 month
					interestRate: 1.5, // 2% per month
					eligibility: [
						"Malaysian citizen aged 21-60",
						"Minimum monthly income of RM2,000",
						"Employed for at least 3 months",
						"No active bankruptcy status",
					],
					lateFeeRate: 0.022, // 0.022% per day interest
					lateFeeFixedAmount: 0, // No fixed fee
					lateFeeFrequencyDays: 7, // every 7 days
					originationFee: 3, // 2% origination fee
					legalFee: 2, // No legal fee
					applicationFee: 50, // No application fee
					requiredDocuments: [
						"Valid Malaysian ID",
						"Latest 3 months payslip",
						"Latest 3 months bank statement",
						"Employment letter",
					],
					features: [
						"Get up to 50% of your salary",
						"Quick 24-hour approval",
						"No collateral required",
						"Flexible repayment options",
						"Competitive interest rates",
					],
					loanTypes: [], // Salary advance doesn't need loan types
					isActive: true,
				},
				{
					code: "equipment",
					name: "Equipment Financing™",
					description:
						"Finance your business equipment with flexible terms. Fast approval with minimal documentation.",
					minAmount: 50000,
					maxAmount: 300000,
					repaymentTerms: [6, 12, 24], // 6, 12, or 24 months
					interestRate: 1.5, // 0.8% per month
					eligibility: [
						"Registered business in Malaysia",
						"Minimum 1 year in operation",
						"Minimum monthly revenue of RM10,000",
						"No active bankruptcy status",
					],
					lateFeeRate: 0.022, // 0.022% per day interest
					lateFeeFixedAmount: 0, // No fixed fee
					lateFeeFrequencyDays: 7, // every 7 days
					originationFee: 3, // 3% origination fee
					legalFee: 2, // RM500 legal fee
					applicationFee: 50, // RM100 application fee
					requiredDocuments: [
						"Business registration (SSM)",
						"Latest 6 months bank statement",
						"Equipment quotation",
						"Directors' IDs",
					],
					features: [
						"Finance up to RM50,000",
						"Flexible repayment terms",
						"Quick approval process",
						"Competitive rates",
						"No early settlement fees",
					],
					loanTypes: [
						"Manufacturing Equipment",
						"Office Equipment",
						"Construction Equipment",
						"Medical Equipment",
						"IT Equipment",
						"Commercial Vehicle",
						"Industrial Machinery",
					],
					isActive: true,
				},
				{
					code: "sme",
					name: "SME Growth™",
					description:
						"Working capital financing for SMEs. Grow your business with flexible funding solutions.",
					minAmount: 50000,
					maxAmount: 500000,
					repaymentTerms: [12, 24, 36], // 12, 24, or 36 months
					interestRate: 1.5, // 0.7% per month
					eligibility: [
						"Registered business in Malaysia",
						"Minimum 2 years in operation",
						"Minimum annual revenue of RM300,000",
						"No active bankruptcy status",
					],
					lateFeeRate: 0.022, // 0.022% per day interest
					lateFeeFixedAmount: 0, // No fixed fee
					lateFeeFrequencyDays: 7, // every 7 days
					originationFee: 2, // 2.5% origination fee
					legalFee: 3, // RM1000 legal fee
					applicationFee: 50, // RM200 application fee
					requiredDocuments: [
						"Business registration (SSM)",
						"Latest 2 years financial statements",
						"Latest 6 months bank statements",
						"Tax returns",
						"Directors' IDs",
					],
					features: [
						"Finance up to RM200,000",
						"Flexible repayment terms",
						"Competitive interest rates",
						"Quick approval process",
						"Dedicated account manager",
					],
					loanTypes: [
						"Working Capital",
						"Business Expansion",
						"Inventory Purchase",
						"Renovation",
						"Marketing & Advertising",
						"Franchise Acquisition",
						"Debt Consolidation",
					],
					isActive: true,
				},
			],
		});
		console.log("Products created successfully");
	} else {
		console.log("Products table is not empty, skipping product creation");
	}

	// Check if system settings table is empty
	const settingsCount = await prisma.systemSettings.count();
	if (settingsCount === 0) {
		console.log("Creating default system settings...");
		
		// Default system settings
		await prisma.systemSettings.createMany({
			data: [
				{
					key: "LOAN_CALCULATION_METHOD",
					category: "LOAN_CALCULATION",
					name: "Loan Calculation Method",
					description: "Method used for calculating loan payment schedules and pro-rated amounts",
					dataType: "ENUM",
					value: JSON.stringify("PROPORTIONAL"),
					options: {
						PROPORTIONAL: {
							label: "Proportional Method",
							description: "Uses actual average days per period for pro-rating (current method)"
						},
						RULE_OF_78: {
							label: "Rule of 78",
							description: "Uses Rule of 78 calculation for front-loaded interest"
						},
						FIXED_30_DAY: {
							label: "Fixed 30-Day",
							description: "Uses fixed 30-day assumption (legacy method)"
						}
					},
					isActive: true,
					requiresRestart: false,
					affectsExistingLoans: false,
				},
				{
					key: "PAYMENT_SCHEDULE_TYPE",
					category: "PAYMENT_SCHEDULE",
					name: "Payment Schedule Type",
					description: "How payment due dates are calculated and scheduled",
					dataType: "ENUM",
					value: JSON.stringify("FIRST_OF_MONTH"),
					options: {
						FIRST_OF_MONTH: {
							label: "1st of Month",
							description: "Payments due on 1st of each month with 20th cutoff rule (current)"
						},
						EXACT_MONTHLY: {
							label: "Exact Monthly",
							description: "Payments due on exact monthly intervals from disbursement (legacy)"
						},
						CUSTOM_DAY: {
							label: "Custom Day",
							description: "Payments due on a custom day of each month (future feature)"
						}
					},
					isActive: true,
					requiresRestart: false,
					affectsExistingLoans: false,
				},
				{
					key: "ENABLE_LATE_FEE_GRACE_PERIOD",
					category: "LATE_FEES",
					name: "Late Fee Grace Period",
					description: "Enable grace period before late fees are applied",
					dataType: "BOOLEAN",
					value: JSON.stringify(true),
					options: undefined,
					isActive: true,
					requiresRestart: false,
					affectsExistingLoans: false,
				},
				{
					key: "LATE_FEE_GRACE_DAYS",
					category: "LATE_FEES",
					name: "Late Fee Grace Days",
					description: "Number of days grace period before late fees are applied",
					dataType: "NUMBER",
					value: JSON.stringify(3),
					options: {
						min: 0,
						max: 30,
						step: 1,
						unit: "days"
					},
					isActive: true,
					requiresRestart: false,
					affectsExistingLoans: false,
				},
				{
					key: "ENABLE_WHATSAPP_NOTIFICATIONS",
					category: "NOTIFICATIONS",
					name: "WhatsApp Notifications",
					description: "Enable automatic WhatsApp notifications for loan events",
					dataType: "BOOLEAN",
					value: JSON.stringify(true),
					options: undefined,
					isActive: true,
					requiresRestart: false,
					affectsExistingLoans: false,
				},
				{
					key: "MINIMUM_LOAN_AMOUNT",
					category: "LOAN_LIMITS",
					name: "Minimum Loan Amount",
					description: "Global minimum loan amount across all products",
					dataType: "NUMBER",
					value: JSON.stringify(500),
					options: {
						min: 100,
						max: 10000,
						step: 100,
						unit: "RM"
					},
					isActive: true,
					requiresRestart: false,
					affectsExistingLoans: false,
				},
				{
					key: "MAXIMUM_ACTIVE_LOANS_PER_USER",
					category: "LOAN_LIMITS",
					name: "Maximum Active Loans Per User",
					description: "Maximum number of active loans a user can have simultaneously",
					dataType: "NUMBER",
					value: JSON.stringify(3),
					options: {
						min: 1,
						max: 10,
						step: 1,
						unit: "loans"
					},
					isActive: true,
					requiresRestart: false,
					affectsExistingLoans: false,
				}
			],
		});
		
		console.log("Default system settings created successfully");
	} else {
		console.log("System settings table is not empty, skipping default settings creation");
	}

	// Check if bank accounts table is empty
	const bankAccountsCount = await prisma.bankAccount.count();
	if (bankAccountsCount === 0) {
		console.log("Creating default bank account...");
		
		// Default bank account (from the current hardcoded values)
		await prisma.bankAccount.create({
			data: {
				bankName: "HSBC Bank Malaysia Berhad",
				accountName: "OPG Capital Holdings Sdn. Bhd.",
				accountNumber: "001866001878013",
				isActive: true,
				isDefault: true
			}
		});
		
		console.log("Default bank account created successfully");
	} else {
		console.log("Bank accounts table is not empty, skipping default bank account creation");
	}

	console.log("Seed completed successfully");
}

main()
	.catch((e) => {
		console.error("Error seeding database:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
