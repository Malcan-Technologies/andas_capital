const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPaymentDoubleCounting() {
    console.log('🔧 Fixing payment double counting issue...');
    
    try {
        const loanId = 'cmcunv1kz000aulcf69vwvn9m';
        
        // Get current state
        const walletTransactions = await prisma.walletTransaction.findMany({
            where: {
                loanId: loanId,
                type: 'LOAN_REPAYMENT',
                status: 'APPROVED'
            },
            orderBy: { createdAt: 'asc' }
        });
        
        const repayments = await prisma.loanRepayment.findMany({
            where: { loanId: loanId },
            orderBy: { dueDate: 'asc' }
        });
        
        console.log(`Found ${walletTransactions.length} wallet transactions`);
        console.log(`Found ${repayments.length} repayments`);
        
        const totalWalletPayments = walletTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        const totalAllocatedAmount = repayments.reduce((sum, rep) => sum + (rep.actualAmount || 0), 0);
        
        console.log(`Total wallet payments: ${totalWalletPayments}`);
        console.log(`Total allocated amount: ${totalAllocatedAmount}`);
        console.log(`Difference: ${Math.abs(totalWalletPayments - totalAllocatedAmount)}`);
        
        if (Math.abs(totalWalletPayments - totalAllocatedAmount) <= 0.01) {
            console.log('✅ Payment allocation is already correct, no fix needed');
            return;
        }
        
        console.log('❌ Payment allocation is incorrect, fixing...');
        
        await prisma.$transaction(async (tx) => {
            // Reset all repayment allocation data
            console.log('Resetting repayment allocation data...');
            await tx.loanRepayment.updateMany({
                where: { loanId: loanId },
                data: {
                    actualAmount: null,
                    principalPaid: 0,
                    lateFeesPaid: 0,
                    status: 'PENDING',
                    paidAt: null,
                    paymentType: null,
                    daysEarly: null,
                    daysLate: null
                }
            });
            
            // Use the payment allocation logic with the correct total
            console.log(`Allocating ${totalWalletPayments} across repayments...`);
            
            const { LateFeeProcessor } = require('./dist/src/lib/lateFeeProcessor.js');
            const mostRecentPayment = walletTransactions[walletTransactions.length - 1];
            
            const allocationResult = await LateFeeProcessor.handlePaymentAllocation(
                loanId,
                totalWalletPayments,
                new Date(mostRecentPayment.createdAt),
                tx
            );
            
            console.log('Payment allocation result:', {
                lateFeesPaid: allocationResult.lateFeesPaid,
                principalPaid: allocationResult.principalPaid,
                remainingPayment: allocationResult.remainingPayment,
                success: allocationResult.success
            });
            
            // Verify the fix
            const updatedRepayments = await tx.loanRepayment.findMany({
                where: { loanId: loanId },
                orderBy: { dueDate: 'asc' }
            });
            
            const newTotalAllocated = updatedRepayments.reduce((sum, rep) => sum + (rep.actualAmount || 0), 0);
            
            console.log(`Verification - New total allocated: ${newTotalAllocated}`);
            console.log(`Difference after fix: ${Math.abs(totalWalletPayments - newTotalAllocated)}`);
            
            if (Math.abs(totalWalletPayments - newTotalAllocated) <= 0.01) {
                console.log('✅ Payment allocation fixed successfully!');
            } else {
                console.log('❌ Payment allocation still incorrect after fix');
            }
        });
        
    } catch (error) {
        console.error('❌ Error fixing payment double counting:', error);
        throw error;
    }
}

fixPaymentDoubleCounting()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }); 