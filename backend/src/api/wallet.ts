import { Router, Response } from "express";
import { PrismaClient, WalletTransactionStatus } from "@prisma/client";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Helper function to update repayment status based on all payments (Hybrid Approach)
async function updateRepaymentStatusFromTransactions(loanId: string, tx: any) {
	console.log(
		`Updating repayment status for loan ${loanId} based on transactions`
	);

	// Get all repayments for this loan, ordered by due date
	const repayments = await tx.loanRepayment.findMany({
		where: { loanId: loanId },
		orderBy: { dueDate: "asc" },
	});

	// Get all approved payment transactions
	const actualPayments = await tx.walletTransaction.findMany({
		where: {
			loanId: loanId,
			type: "LOAN_REPAYMENT",
			status: "APPROVED",
		},
		orderBy: { processedAt: "asc" },
	});

	// Calculate total payments made
	const totalPaymentsMade = actualPayments.reduce(
		(total: number, payment: any) => {
			return total + Math.abs(payment.amount);
		},
		0
	);

	console.log(`Total payments made: ${totalPaymentsMade}`);

	// Apply payments to repayments chronologically to determine status
	let remainingPayments = totalPaymentsMade;
	const mostRecentPayment = actualPayments[actualPayments.length - 1];
	const mostRecentPaymentDate =
		mostRecentPayment?.processedAt || mostRecentPayment?.createdAt;

	for (const repayment of repayments) {
		if (remainingPayments <= 0) {
			// No payments left - mark as PENDING
			await tx.loanRepayment.update({
				where: { id: repayment.id },
				data: {
					status: "PENDING",
					actualAmount: null,
					paidAt: null,
					paymentType: null,
					daysEarly: null,
					daysLate: null,
				},
			});
		} else if (remainingPayments >= repayment.amount) {
			// Fully covered by payments
			const dueDate = new Date(repayment.dueDate);
			const paidDate = new Date(mostRecentPaymentDate || new Date());
			const daysDiff = Math.ceil(
				(paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
			);

			const daysEarly = daysDiff < 0 ? Math.abs(daysDiff) : 0;
			const daysLate = daysDiff > 0 ? daysDiff : 0;

			// Check if repayment status is changing from non-COMPLETED to COMPLETED
			const wasCompleted = repayment.status === "COMPLETED";

			// Handle late fees first to determine total amount paid
			let totalAmountPaidForThisRepayment = repayment.amount;
			let lateFeesPaid = 0;

			if (!wasCompleted) {
				// New completion - handle late fees and calculate total amount
				try {
					const { LateFeeProcessor } = await import(
						"../lib/lateFeeProcessor"
					);
					const lateFeeResult =
						await LateFeeProcessor.handleRepaymentCleared(
							repayment.id,
							remainingPayments, // Amount available for this repayment
							paidDate,
							tx
						);

					lateFeesPaid = lateFeeResult.lateFeesPaid;
					totalAmountPaidForThisRepayment =
						repayment.amount + lateFeesPaid;

					console.log(
						`💰 Late fee handling for repayment ${repayment.id}:`,
						{
							lateFeesPaid: lateFeeResult.lateFeesPaid,
							lateFeesWaived: lateFeeResult.lateFeesWaived,
							totalLateFees: lateFeeResult.totalLateFees,
							totalAmountPaidForThisRepayment,
						}
					);
				} catch (error) {
					console.error(
						`Error handling late fees for repayment ${repayment.id}:`,
						error
					);
					// Don't fail the payment processing due to late fee errors
				}

				await tx.loanRepayment.update({
					where: { id: repayment.id },
					data: {
						status: "COMPLETED",
						actualAmount: totalAmountPaidForThisRepayment, // Total amount including late fees
						paidAt: mostRecentPaymentDate,
						paymentType:
							daysEarly > 0
								? "EARLY"
								: daysLate > 0
								? "LATE"
								: "ON_TIME",
						daysEarly: daysEarly,
						daysLate: daysLate,
					},
				});

				console.log(`✅ Marked repayment ${repayment.id} as COMPLETED`);
			} else {
				// Already completed - preserve existing actualAmount (which includes late fees)
				totalAmountPaidForThisRepayment =
					repayment.actualAmount || repayment.amount;
				console.log(
					`✅ Repayment ${repayment.id} already COMPLETED with actualAmount: ${totalAmountPaidForThisRepayment}`
				);
			}

			remainingPayments -= totalAmountPaidForThisRepayment;
		} else {
			// Partially covered
			const dueDate = new Date(repayment.dueDate);
			const paidDate = new Date(mostRecentPaymentDate || new Date());
			const daysDiff = Math.ceil(
				(paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
			);

			const daysEarly = daysDiff < 0 ? Math.abs(daysDiff) : 0;
			const daysLate = daysDiff > 0 ? daysDiff : 0;

			await tx.loanRepayment.update({
				where: { id: repayment.id },
				data: {
					status: "PENDING", // Still pending since not fully paid
					actualAmount: remainingPayments, // Amount actually paid towards this repayment
					paidAt: mostRecentPaymentDate,
					paymentType: "PARTIAL",
					daysEarly: daysEarly,
					daysLate: daysLate,
				},
			});

			console.log(
				`💰 Marked repayment ${repayment.id} as PARTIAL: ${remainingPayments} of ${repayment.amount}`
			);
			remainingPayments = 0; // All remaining payments applied to this repayment
		}
	}
}

// Helper function to update payment schedule after payment (Hybrid Approach)
async function updatePaymentScheduleAfterPayment(
	loanId: string,
	paymentAmount: number,
	tx: any
) {
	console.log(`💰 Processing payment of ${paymentAmount} for loan ${loanId}`);

	// Update repayment status based on all transactions (preserves individual payment history)
	await updateRepaymentStatusFromTransactions(loanId, tx);

	// Calculate new outstanding balance based on actual transactions
	const newOutstandingBalance = await calculateOutstandingBalance(loanId, tx);

	// Calculate next payment due
	const nextPaymentDue = await calculateNextPaymentDue(loanId, tx);

	// Status is handled in calculateOutstandingBalance function

	await tx.loan.update({
		where: { id: loanId },
		data: {
			nextPaymentDue: nextPaymentDue,
		},
	});

	console.log(
		`Updated loan ${loanId}: outstanding ${newOutstandingBalance}, nextPaymentDue ${nextPaymentDue}`
	);
}

// Helper function to calculate outstanding balance based on actual transactions
export async function calculateOutstandingBalance(loanId: string, tx: any) {
	// Get the loan to get the total amount and current status
	const loan = await tx.loan.findUnique({
		where: { id: loanId },
	});

	if (!loan) {
		throw new Error(`Loan ${loanId} not found`);
	}

	// Get all APPROVED wallet transactions for this loan (actual payments made)
	const actualPayments = await tx.walletTransaction.findMany({
		where: {
			loanId: loanId,
			type: "LOAN_REPAYMENT",
			status: "APPROVED",
		},
	});

	// Get total unpaid late fees for this loan
	const unpaidLateFees = await tx.$queryRawUnsafe(
		`
		SELECT COALESCE(SUM(lf."feeAmount"), 0) as total_unpaid_late_fees
		FROM late_fees lf
		JOIN loan_repayments lr ON lf."loanRepaymentId" = lr.id
		WHERE lr."loanId" = $1 AND lf.status = 'ACTIVE'
	`,
		loanId
	);
	const totalUnpaidLateFees = Number(
		unpaidLateFees[0]?.total_unpaid_late_fees || 0
	);

	console.log(`Calculating outstanding balance for loan ${loanId}:`);
	console.log(`Original loan amount: ${loan.totalAmount}`);
	console.log(`Unpaid late fees: ${totalUnpaidLateFees}`);

	// Calculate total actual payments made (sum of all approved payment transactions)
	const totalPaymentsMade = actualPayments.reduce(
		(total: number, payment: any) => {
			// Payment amounts are stored as negative, so we take absolute value
			const paymentAmount = Math.abs(payment.amount);
			console.log(`Payment transaction ${payment.id}: ${paymentAmount}`);
			return total + paymentAmount;
		},
		0
	);

	console.log(`Total payments made: ${totalPaymentsMade}`);

	// Outstanding balance = Original loan amount + Unpaid late fees - Total actual payments made
	const totalAmountOwed = loan.totalAmount + totalUnpaidLateFees;
	const outstandingBalance =
		Math.round((totalAmountOwed - totalPaymentsMade) * 100) / 100;
	const finalOutstandingBalance = Math.max(0, outstandingBalance);

	console.log(`Outstanding balance: ${finalOutstandingBalance}`);

	// Check if loan should be marked as PENDING_DISCHARGE
	if (loan.status === "ACTIVE" && finalOutstandingBalance === 0) {
		console.log(
			`🎯 Loan ${loanId} fully paid - updating status to PENDING_DISCHARGE`
		);
		await tx.loan.update({
			where: { id: loanId },
			data: {
				status: "PENDING_DISCHARGE",
				outstandingBalance: finalOutstandingBalance,
			},
		});
	} else {
		// Just update the outstanding balance
		await tx.loan.update({
			where: { id: loanId },
			data: { outstandingBalance: finalOutstandingBalance },
		});
	}

	return finalOutstandingBalance;
}

// Helper function to calculate next payment due based on actual payments
async function calculateNextPaymentDue(loanId: string, tx: any) {
	// Get all repayments for this loan, ordered by due date
	const repayments = await tx.loanRepayment.findMany({
		where: { loanId: loanId },
		orderBy: { dueDate: "asc" },
	});

	// Get total payments made
	const actualPayments = await tx.walletTransaction.findMany({
		where: {
			loanId: loanId,
			type: "LOAN_REPAYMENT",
			status: "APPROVED",
		},
	});

	const totalPaymentsMade = actualPayments.reduce(
		(total: number, payment: any) => {
			return total + Math.abs(payment.amount);
		},
		0
	);

	// Apply payments to repayments in chronological order to find next due
	let remainingPayments = totalPaymentsMade;

	for (const repayment of repayments) {
		// Get late fees for this repayment
		const lateFees = await tx.$queryRawUnsafe(
			`
			SELECT COALESCE(SUM("feeAmount"), 0) as total_late_fees
			FROM late_fees 
			WHERE "loanRepaymentId" = $1 AND status = 'ACTIVE'
		`,
			repayment.id
		);
		const totalLateFees = Number(lateFees[0]?.total_late_fees || 0);
		const totalAmountDue = repayment.amount + totalLateFees;

		if (remainingPayments <= 0) {
			// This repayment hasn't been paid yet
			return repayment.dueDate;
		}

		if (remainingPayments >= totalAmountDue) {
			// This repayment is fully covered (including late fees)
			remainingPayments -= totalAmountDue;
		} else {
			// This repayment is partially covered, so it's the next due
			return repayment.dueDate;
		}
	}

	// All repayments are covered
	return null;
}

// Get user's wallet data
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.user!.userId;

		// Get or create wallet for user
		let wallet = await prisma.wallet.findUnique({
			where: { userId },
			include: {
				transactions: {
					orderBy: { createdAt: "desc" },
					take: 10,
				},
			},
		});

		if (!wallet) {
			// Create wallet if it doesn't exist
			wallet = await prisma.wallet.create({
				data: {
					userId,
					balance: 0,
					availableForWithdrawal: 0,
					totalDeposits: 0,
					totalWithdrawals: 0,
				},
				include: {
					transactions: {
						orderBy: { createdAt: "desc" },
						take: 10,
					},
				},
			});
		}

		// Get user's bank connection status
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				bankName: true,
				accountNumber: true,
			},
		});

		// Get loan summary
		const loans = await prisma.loan.findMany({
			where: { userId },
			include: {
				repayments: true,
			},
		});

		// Calculate total repaid from actual wallet transactions (consistent with outstandingBalance calculation)
		const totalRepaidFromTransactions =
			await prisma.walletTransaction.aggregate({
				where: {
					userId,
					type: "LOAN_REPAYMENT",
					status: "APPROVED",
				},
				_sum: {
					amount: true,
				},
			});

		// Calculate next payment due and amount considering prepayments
		let nextPaymentDue = null;
		let nextPaymentAmount = 0;

		for (const loan of loans.filter((loan) => loan.status === "ACTIVE")) {
			// Get all repayments for this loan, ordered by due date
			const repayments = await prisma.loanRepayment.findMany({
				where: { loanId: loan.id },
				orderBy: { dueDate: "asc" },
			});

			// Get total payments made for this loan
			const actualPayments = await prisma.walletTransaction.findMany({
				where: {
					loanId: loan.id,
					type: "LOAN_REPAYMENT",
					status: "APPROVED",
				},
			});

			const totalPaymentsMade = actualPayments.reduce(
				(total: number, payment: any) => {
					return total + Math.abs(payment.amount);
				},
				0
			);

			// Apply payments to repayments in chronological order to find next due
			let remainingPayments = totalPaymentsMade;

			for (const repayment of repayments) {
				if (remainingPayments <= 0) {
					// This repayment hasn't been paid yet - it's the next due
					if (
						!nextPaymentDue ||
						new Date(repayment.dueDate) < new Date(nextPaymentDue)
					) {
						nextPaymentDue = repayment.dueDate;
						nextPaymentAmount = repayment.amount;
					}
					break;
				}

				if (remainingPayments >= repayment.amount) {
					// This repayment is fully covered
					remainingPayments -= repayment.amount;
				} else {
					// This repayment is partially covered - remaining amount is next due
					const remainingAmount =
						repayment.amount - remainingPayments;
					if (
						!nextPaymentDue ||
						new Date(repayment.dueDate) < new Date(nextPaymentDue)
					) {
						nextPaymentDue = repayment.dueDate;
						nextPaymentAmount = remainingAmount;
					}
					break;
				}
			}
		}

		const loanSummary = {
			totalOutstanding: loans.reduce(
				(sum, loan) => sum + loan.outstandingBalance,
				0
			),
			totalBorrowed: loans.reduce(
				(sum, loan) => sum + (loan.totalAmount || loan.principalAmount),
				0
			),
			totalRepaid: Math.abs(totalRepaidFromTransactions._sum.amount || 0),
			nextPaymentDue,
			nextPaymentAmount,
		};

		// Calculate total disbursed from loan disbursement transactions
		const totalDisbursed = await prisma.walletTransaction.aggregate({
			where: {
				userId,
				type: "LOAN_DISBURSEMENT",
				status: "APPROVED",
			},
			_sum: {
				amount: true,
			},
		});

		const walletData = {
			balance: wallet.balance,
			availableForWithdrawal: wallet.availableForWithdrawal,
			totalDeposits: wallet.totalDeposits,
			totalWithdrawals: wallet.totalWithdrawals,
			totalDisbursed: totalDisbursed._sum.amount || 0,
			pendingTransactions: wallet.transactions.filter(
				(t) => t.status === WalletTransactionStatus.PENDING
			).length,
			bankConnected: !!(user?.bankName && user?.accountNumber),
			bankName: user?.bankName,
			accountNumber: user?.accountNumber,
			loanSummary,
		};

		res.json(walletData);
		return;
	} catch (error) {
		console.error("Error fetching wallet data:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});

// Get wallet transactions
router.get(
	"/transactions",
	authenticateToken,
	async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user!.userId;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 20;
			const skip = (page - 1) * limit;

			const transactions = await prisma.walletTransaction.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
				include: {
					loan: {
						include: {
							application: {
								include: {
									product: true,
								},
							},
						},
					},
				},
			});

			const total = await prisma.walletTransaction.count({
				where: { userId },
			});

			res.json({
				transactions,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit),
				},
			});
			return;
		} catch (error) {
			console.error("Error fetching transactions:", error);
			res.status(500).json({ error: "Internal server error" });
			return;
		}
	}
);

// Create deposit transaction
router.post(
	"/deposit",
	authenticateToken,
	async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user!.userId;
			const { amount, description } = req.body;

			if (!amount || amount <= 0) {
				return res.status(400).json({ error: "Invalid amount" });
			}

			// Get or create wallet
			let wallet = await prisma.wallet.findUnique({
				where: { userId },
			});

			if (!wallet) {
				wallet = await prisma.wallet.create({
					data: {
						userId,
						balance: 0,
						availableForWithdrawal: 0,
						totalDeposits: 0,
						totalWithdrawals: 0,
					},
				});
			}

			// Create transaction
			const transaction = await prisma.walletTransaction.create({
				data: {
					userId,
					walletId: wallet.id,
					type: "DEPOSIT",
					amount: parseFloat(amount),
					status: WalletTransactionStatus.PENDING,
					description: description || "Bank transfer deposit",
					reference: `DEP-${Date.now()}`,
				},
			});

			res.status(201).json(transaction);
			return;
		} catch (error) {
			console.error("Error creating deposit:", error);
			res.status(500).json({ error: "Internal server error" });
			return;
		}
	}
);

// Create withdrawal transaction
router.post(
	"/withdraw",
	authenticateToken,
	async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user!.userId;
			const { amount, bankAccount, description } = req.body;

			if (!amount || amount <= 0) {
				return res.status(400).json({ error: "Invalid amount" });
			}

			if (!bankAccount) {
				return res
					.status(400)
					.json({ error: "Bank account is required" });
			}

			// Get wallet
			const wallet = await prisma.wallet.findUnique({
				where: { userId },
			});

			if (!wallet) {
				return res.status(404).json({ error: "Wallet not found" });
			}

			if (wallet.availableForWithdrawal < parseFloat(amount)) {
				return res.status(400).json({ error: "Insufficient funds" });
			}

			// Create transaction with bank account info in metadata
			const transaction = await prisma.walletTransaction.create({
				data: {
					userId,
					walletId: wallet.id,
					type: "WITHDRAWAL",
					amount: -parseFloat(amount),
					status: WalletTransactionStatus.PENDING,
					description: description || `Withdrawal to ${bankAccount}`,
					reference: `WD-${Date.now()}`,
					metadata: {
						bankAccount: bankAccount,
						withdrawalMethod: "BANK_TRANSFER",
					},
				},
			});

			res.status(201).json(transaction);
			return;
		} catch (error) {
			console.error("Error creating withdrawal:", error);
			res.status(500).json({ error: "Internal server error" });
			return;
		}
	}
);

// Create loan repayment transaction
router.post(
	"/repay-loan",
	authenticateToken,
	async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user!.userId;
			const { loanId, amount, paymentMethod, description } = req.body;

			if (!loanId || !amount || amount <= 0) {
				return res
					.status(400)
					.json({ error: "Invalid loan ID or amount" });
			}

			if (
				!paymentMethod ||
				!["WALLET_BALANCE", "FRESH_FUNDS"].includes(paymentMethod)
			) {
				return res.status(400).json({
					error: "Invalid payment method. Must be WALLET_BALANCE or FRESH_FUNDS",
				});
			}

			// Get loan
			const loan = await prisma.loan.findFirst({
				where: {
					id: loanId,
					userId,
					status: {
						in: ["ACTIVE", "OVERDUE"],
					},
				},
			});

			if (!loan) {
				return res.status(404).json({ error: "Active loan not found" });
			}

			// Round amount to 2 decimal places to avoid floating-point precision issues
			const paymentAmount = Math.round(parseFloat(amount) * 100) / 100;

			// Validate repayment amount doesn't exceed outstanding balance
			if (paymentAmount > loan.outstandingBalance) {
				return res.status(400).json({
					error: "Repayment amount cannot exceed outstanding balance",
					outstandingBalance: loan.outstandingBalance,
				});
			}

			// Get wallet
			const wallet = await prisma.wallet.findUnique({
				where: { userId },
			});

			if (!wallet) {
				return res.status(404).json({ error: "Wallet not found" });
			}

			// For wallet balance payments, check sufficient funds
			if (paymentMethod === "WALLET_BALANCE") {
				if (wallet.availableForWithdrawal < paymentAmount) {
					return res.status(400).json({
						error: "Insufficient wallet balance",
						availableBalance: wallet.availableForWithdrawal,
					});
				}
			}

			// Create transaction with payment method metadata
			const transaction = await prisma.walletTransaction.create({
				data: {
					userId,
					walletId: wallet.id,
					loanId,
					type: "LOAN_REPAYMENT",
					amount: -paymentAmount, // Negative for outgoing payment
					status:
						paymentMethod === "WALLET_BALANCE"
							? WalletTransactionStatus.APPROVED // Auto-approve wallet balance payments
							: WalletTransactionStatus.PENDING, // Fresh funds need approval
					description:
						description ||
						`Loan repayment for loan ${loanId} via ${paymentMethod}`,
					reference: `REP-${Date.now()}`,
					metadata: {
						paymentMethod,
						loanId,
						outstandingBalance: loan.outstandingBalance,
						originalAmount: paymentAmount, // Store positive amount for reference
					},
				},
			});

			// If using wallet balance, immediately process the repayment
			if (paymentMethod === "WALLET_BALANCE") {
				await prisma.$transaction(async (tx) => {
					// Update wallet balance
					const newBalance = wallet.balance - paymentAmount;
					const newAvailable = Math.max(0, newBalance);

					await tx.wallet.update({
						where: { id: wallet.id },
						data: {
							balance: newBalance,
							availableForWithdrawal: newAvailable,
							totalWithdrawals:
								wallet.totalWithdrawals + paymentAmount,
						},
					});

					// Update loan repayments schedule properly
					await updatePaymentScheduleAfterPayment(
						loanId,
						paymentAmount,
						tx
					);

					// Update transaction to processed
					await tx.walletTransaction.update({
						where: { id: transaction.id },
						data: {
							processedAt: new Date(),
						},
					});

					// Create notification for successful payment
					await tx.notification.create({
						data: {
							userId,
							title: "Payment Processed",
							message: `Your loan repayment of ${formatCurrency(
								paymentAmount
							)} has been processed successfully.`,
							type: "SYSTEM",
							priority: "MEDIUM",
							metadata: {
								transactionId: transaction.id,
								loanId,
								amount: paymentAmount,
								paymentMethod,
							},
						},
					});
				});
			} else {
				// For fresh funds, create notification about pending approval
				await prisma.notification.create({
					data: {
						userId,
						title: "Payment Submitted",
						message: `Your loan repayment of ${formatCurrency(
							paymentAmount
						)} has been submitted and is awaiting approval.`,
						type: "SYSTEM",
						priority: "MEDIUM",
						metadata: {
							transactionId: transaction.id,
							loanId,
							amount: paymentAmount,
							paymentMethod,
						},
					},
				});
			}

			// Helper function to format currency
			function formatCurrency(amount: number): string {
				return new Intl.NumberFormat("en-MY", {
					style: "currency",
					currency: "MYR",
					minimumFractionDigits: 0,
					maximumFractionDigits: 0,
				}).format(amount);
			}

			res.status(201).json({
				...transaction,
				message:
					paymentMethod === "WALLET_BALANCE"
						? "Loan repayment processed successfully"
						: "Loan repayment request submitted. Awaiting fund transfer confirmation.",
			});
			return;
		} catch (error) {
			console.error("Error creating loan repayment:", error);
			res.status(500).json({ error: "Internal server error" });
			return;
		}
	}
);

// Process pending transaction (admin/system use)
router.patch(
	"/transactions/:id/process",
	authenticateToken,
	async (req: AuthRequest, res: Response) => {
		try {
			const { id } = req.params;
			const { status } = req.body; // "APPROVED" or "REJECTED"

			if (!["APPROVED", "REJECTED"].includes(status)) {
				return res.status(400).json({ error: "Invalid status" });
			}

			const transaction = await prisma.walletTransaction.findUnique({
				where: { id },
				include: { wallet: true, loan: true },
			});

			if (!transaction) {
				return res.status(404).json({ error: "Transaction not found" });
			}

			if (transaction.status !== WalletTransactionStatus.PENDING) {
				return res
					.status(400)
					.json({ error: "Transaction is not pending" });
			}

			// Update transaction status
			const updatedTransaction = await prisma.$transaction(async (tx) => {
				// Update transaction
				const updated = await tx.walletTransaction.update({
					where: { id },
					data: {
						status: status as WalletTransactionStatus,
						processedAt: new Date(),
					},
				});

				if (status === "APPROVED") {
					// Update wallet balance
					const newBalance =
						transaction.wallet.balance + transaction.amount;
					const newAvailable = Math.max(0, newBalance); // Ensure non-negative

					await tx.wallet.update({
						where: { id: transaction.walletId },
						data: {
							balance: newBalance,
							availableForWithdrawal: newAvailable,
							totalDeposits:
								transaction.amount > 0
									? transaction.wallet.totalDeposits +
									  transaction.amount
									: transaction.wallet.totalDeposits,
							totalWithdrawals:
								transaction.amount < 0
									? transaction.wallet.totalWithdrawals +
									  Math.abs(transaction.amount)
									: transaction.wallet.totalWithdrawals,
						},
					});

					// If it's a loan repayment, update loan repayments schedule
					if (
						transaction.type === "LOAN_REPAYMENT" &&
						transaction.loan
					) {
						const paymentAmount = Math.abs(transaction.amount);
						await updatePaymentScheduleAfterPayment(
							transaction.loanId!,
							paymentAmount,
							tx
						);
					}
				}

				return updated;
			});

			res.json(updatedTransaction);
			return;
		} catch (error) {
			console.error("Error processing transaction:", error);
			res.status(500).json({ error: "Internal server error" });
			return;
		}
	}
);

export default router;
