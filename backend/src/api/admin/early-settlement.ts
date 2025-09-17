import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, AuthRequest } from "../../middleware/auth";
import { requireAdminOrAttestor } from "../../lib/permissions";
import { SafeMath } from "../../lib/precisionUtils";
import ReceiptService from "../../lib/receiptService";
import whatsappService from "../../lib/whatsappService";

const router = Router();
const prisma = new PrismaClient();

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR'
  }).format(amount);
};

// Get pending early settlement requests
router.get('/pending', authenticateToken, requireAdminOrAttestor, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause: any = {
      status: 'PENDING',
      metadata: {
        path: ['kind'],
        equals: 'EARLY_SETTLEMENT'
      }
    };

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { reference: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { 
          loan: {
            user: {
              OR: [
                { fullName: { contains: search as string, mode: 'insensitive' } },
                { phoneNumber: { contains: search as string, mode: 'insensitive' } }
              ]
            }
          }
        }
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              email: true
            }
          },
          loan: {
            select: {
              id: true,
              principalAmount: true,
              outstandingBalance: true,
              interestRate: true,
              term: true,
              status: true,
              disbursedAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: Number(limit)
      }),
      prisma.walletTransaction.count({
        where: whereClause
      })
    ]);

    return res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching pending early settlements:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending early settlements'
    });
  }
});

// Get early settlement request details
router.get('/:transactionId', authenticateToken, requireAdminOrAttestor, async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;

    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true
          }
        },
        loan: {
          include: {
            repayments: {
              where: {
                status: { in: ['PENDING', 'PARTIAL'] },
                dueDate: { gte: new Date() }
              },
              orderBy: { dueDate: 'asc' }
            }
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Early settlement request not found'
      });
    }

    if ((transaction.metadata as any)?.kind !== 'EARLY_SETTLEMENT') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not an early settlement request'
      });
    }

    return res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching early settlement details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch early settlement details'
    });
  }
});

// Approve early settlement request
router.post('/:transactionId/approve', authenticateToken, requireAdminOrAttestor, async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const adminUserId = req.user!.userId;
    const { notes } = req.body;

    // Get the transaction with loan details
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: {
        loan: {
          include: {
            repayments: {
              where: {
                status: { in: ['PENDING', 'PARTIAL'] }
              }
            }
          }
        },
        user: true
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Early settlement request not found'
      });
    }

    if (transaction.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not pending approval'
      });
    }

    if ((transaction.metadata as any)?.kind !== 'EARLY_SETTLEMENT') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not an early settlement request'
      });
    }

    const loan = transaction.loan!;
    const quote = (transaction.metadata as any).quote;

    // Start transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Approve the wallet transaction
      await tx.walletTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'APPROVED',
          processedAt: new Date(),
          metadata: {
            ...(transaction.metadata as any),
            approvedBy: adminUserId,
            approvedAt: new Date().toISOString(),
            notes: notes || null
          }
        }
      });

      // 2. Create a consolidated early settlement repayment record
      const earlySettlementRepayment = await tx.loanRepayment.create({
        data: {
          loanId: loan.id,
          amount: SafeMath.toNumber(quote.totalSettlement),
          principalAmount: SafeMath.toNumber(quote.remainingPrincipal),
          interestAmount: SafeMath.toNumber(quote.remainingInterest - quote.discountAmount),
          lateFeeAmount: SafeMath.toNumber(quote.lateFeesAmount || 0),
          status: 'COMPLETED',
          dueDate: new Date(),
          paidAt: new Date(),
          actualAmount: SafeMath.toNumber(quote.totalSettlement),
          principalPaid: SafeMath.toNumber(quote.remainingPrincipal),
          lateFeesPaid: SafeMath.toNumber(quote.lateFeesAmount || 0),
          paymentType: 'EARLY_SETTLEMENT',
          installmentNumber: null, // This is a special settlement, not a regular installment
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // 3. Get all repayments that will be cancelled and store their original statuses
      const repaymentsToCancel = await tx.loanRepayment.findMany({
        where: {
          loanId: loan.id,
          status: { in: ['PENDING', 'PARTIAL'] }
        },
        select: {
          id: true,
          status: true,
          actualAmount: true,
          principalPaid: true,
          lateFeesPaid: true
        }
      });

      // Store original repayment statuses in transaction metadata for potential reversion
      const originalRepaymentStatuses = repaymentsToCancel.map(r => ({
        id: r.id,
        originalStatus: r.status,
        originalActualAmount: r.actualAmount,
        originalPrincipalPaid: r.principalPaid,
        originalLateFeesPaid: r.lateFeesPaid
      }));

      // Update transaction metadata to include original repayment statuses
      await tx.walletTransaction.update({
        where: { id: transactionId },
        data: {
          metadata: {
            ...(transaction.metadata as any || {}),
            originalRepaymentStatuses,
            earlySettlementRepaymentId: earlySettlementRepayment.id
          }
        }
      });

      // Mark all remaining future repayments as CANCELLED (not PAID)
      await tx.loanRepayment.updateMany({
        where: {
          loanId: loan.id,
          status: { in: ['PENDING', 'PARTIAL'] }
        },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      });

      // 4. Update loan status to PENDING_DISCHARGE (use existing discharge workflow)
      await tx.loan.update({
        where: { id: loan.id },
        data: {
          status: 'PENDING_DISCHARGE',
          outstandingBalance: 0,
          updatedAt: new Date()
        }
      });

      // 5. Create audit trail entry for early settlement approval
      if (loan.applicationId) {
        await tx.loanApplicationHistory.create({
          data: {
            applicationId: loan.applicationId,
            previousStatus: 'PENDING_EARLY_SETTLEMENT',
            newStatus: 'PENDING_DISCHARGE',
            changedBy: adminUserId,
            changeReason: 'Early Settlement Approved',
            notes: `Early settlement approved. Settlement amount: ${formatCurrency(SafeMath.toNumber(quote.totalSettlement))}. Interest discount: ${formatCurrency(SafeMath.toNumber(quote.discountAmount))}. Early settlement fee: ${formatCurrency(SafeMath.toNumber(quote.feeAmount || 0))}.${notes ? ` Admin notes: ${notes}` : ''}`,
            metadata: {
              kind: 'EARLY_SETTLEMENT_APPROVAL',
              transactionId: transactionId,
              settlementDetails: {
                totalSettlement: SafeMath.toNumber(quote.totalSettlement),
                remainingPrincipal: SafeMath.toNumber(quote.remainingPrincipal),
                remainingInterest: SafeMath.toNumber(quote.remainingInterest),
                discountAmount: SafeMath.toNumber(quote.discountAmount),
                earlySettlementFee: SafeMath.toNumber(quote.feeAmount || 0),
                lateFeesAmount: SafeMath.toNumber(quote.lateFeesAmount || 0),
                interestSaved: SafeMath.toNumber(quote.discountAmount),
                netSavings: SafeMath.toNumber(quote.discountAmount - (quote.feeAmount || 0))
              },
              approvedBy: adminUserId,
              approvedAt: new Date().toISOString()
            }
          }
        });
      }

      // 5. Generate payment receipt using the new repayment record
      try {
        console.log(`🧾 Generating receipt for early settlement repayment: ${earlySettlementRepayment.id}`);
        const receiptResult = await ReceiptService.generateReceipt({
          repaymentId: earlySettlementRepayment.id,
          generatedBy: adminUserId,
          paymentMethod: 'Early Settlement',
          reference: transaction.reference || 'N/A',
          actualPaymentAmount: SafeMath.toNumber(quote.totalSettlement),
          transactionId: transactionId
        });
        console.log(`🧾 ✅ Early settlement receipt generated successfully: ${receiptResult.receiptNumber}`);
      } catch (receiptError) {
        console.error('🧾 ❌ Error generating early settlement receipt:', receiptError);
        // Don't fail the transaction for receipt generation errors
      }

      // 6. Create notification for user
      await tx.notification.create({
        data: {
          userId: transaction.userId,
          title: 'Early Settlement Approved',
          message: `Your early settlement request for RM ${quote.totalSettlement.toFixed(2)} has been approved. Your loan has been fully discharged.`,
          type: 'SYSTEM',
          priority: 'HIGH',
          metadata: {
            loanId: loan.id,
            transactionId,
            settlementAmount: quote.totalSettlement
          }
        }
      });
    });

    // Send WhatsApp notification (outside transaction to avoid blocking)
    try {
      if (transaction.user.phoneNumber) {
        await whatsappService.sendEarlySettlementApproved(
          transaction.user.phoneNumber,
          transaction.user.fullName || 'Valued Customer',
          quote.totalSettlement
        );
      }
    } catch (whatsappError) {
      console.error('Error sending WhatsApp notification:', whatsappError);
      // Don't fail the request for WhatsApp errors
    }

    return res.json({
      success: true,
      message: 'Early settlement request approved successfully',
      data: {
        transactionId,
        settlementAmount: quote.totalSettlement,
        loanId: loan.id
      }
    });
  } catch (error) {
    console.error('Error approving early settlement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve early settlement request'
    });
  }
});

// Reject early settlement request
router.post('/:transactionId/reject', authenticateToken, requireAdminOrAttestor, async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const adminUserId = req.user!.userId;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Get the transaction
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: {
        user: true,
        loan: true
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Early settlement request not found'
      });
    }

    if (transaction.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not pending approval'
      });
    }

    if ((transaction.metadata as any)?.kind !== 'EARLY_SETTLEMENT') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not an early settlement request'
      });
    }

    // Update transaction status to REJECTED and revert loan status
    await prisma.$transaction(async (tx) => {
      // Update wallet transaction to REJECTED
      await tx.walletTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'REJECTED',
          processedAt: new Date(),
          metadata: {
            ...(transaction.metadata as any),
            rejectedBy: adminUserId,
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason,
            notes: notes || null
          }
        }
      });

      // Restore original repayment statuses if they were stored
      const originalRepaymentStatuses = (transaction.metadata as any)?.originalRepaymentStatuses;
      const earlySettlementRepaymentId = (transaction.metadata as any)?.earlySettlementRepaymentId;
      
      if (originalRepaymentStatuses && Array.isArray(originalRepaymentStatuses)) {
        // Restore each repayment to its original status
        for (const repaymentStatus of originalRepaymentStatuses) {
          await tx.loanRepayment.update({
            where: { id: repaymentStatus.id },
            data: {
              status: repaymentStatus.originalStatus,
              actualAmount: repaymentStatus.originalActualAmount,
              principalPaid: repaymentStatus.originalPrincipalPaid,
              lateFeesPaid: repaymentStatus.originalLateFeesPaid,
              updatedAt: new Date()
            }
          });
        }
      }
      
      // Remove the early settlement repayment record if it exists
      if (earlySettlementRepaymentId) {
        await tx.loanRepayment.delete({
          where: { id: earlySettlementRepaymentId }
        }).catch((error) => {
          // Log error but don't fail the transaction if repayment doesn't exist
          console.warn('Early settlement repayment record not found for deletion:', error);
        });
      }

      // Revert loan status back to ACTIVE (or original status)
      await tx.loan.update({
        where: { id: transaction.loanId! },
        data: {
          status: 'ACTIVE', // Revert to active status
          updatedAt: new Date()
        }
      });

      // Create audit trail entry for early settlement rejection
      if (transaction.loan?.applicationId) {
        const quote = (transaction.metadata as any)?.quote;
        await tx.loanApplicationHistory.create({
          data: {
            applicationId: transaction.loan.applicationId,
            previousStatus: 'PENDING_EARLY_SETTLEMENT',
            newStatus: 'ACTIVE',
            changedBy: adminUserId,
            changeReason: 'Early Settlement Rejected',
            notes: `Early settlement request rejected. Reason: ${reason}.${notes ? ` Admin notes: ${notes}` : ''} Settlement amount was: ${quote ? formatCurrency(SafeMath.toNumber(quote.totalSettlement)) : 'N/A'}.`,
            metadata: {
              kind: 'EARLY_SETTLEMENT_REJECTION',
              transactionId: transactionId,
              rejectionReason: reason,
              rejectedBy: adminUserId,
              rejectedAt: new Date().toISOString(),
              originalQuote: quote || null
            }
          }
        });
      }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: transaction.userId,
        title: 'Early Settlement Rejected',
        message: `Your early settlement request has been rejected. Reason: ${reason}`,
        type: 'SYSTEM',
        priority: 'HIGH',
        metadata: {
          loanId: transaction.loanId,
          transactionId,
          rejectionReason: reason
        }
      }
    });

    // Send WhatsApp notification (if enabled)
    try {
      if (transaction.user.phoneNumber) {
        await whatsappService.sendEarlySettlementRejected(
          transaction.user.phoneNumber,
          transaction.user.fullName || 'Valued Customer',
          reason
        );
      }
    } catch (whatsappError) {
      console.error('Error sending WhatsApp notification:', whatsappError);
      // Don't fail the request for WhatsApp errors
    }

    return res.json({
      success: true,
      message: 'Early settlement request rejected successfully',
      data: {
        transactionId,
        rejectionReason: reason
      }
    });
  } catch (error) {
    console.error('Error rejecting early settlement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject early settlement request'
    });
  }
});

export default router;
