const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDuplicateTransactions() {
    console.log('🔧 Fixing duplicate wallet transactions...');
    
    try {
        const loanId = 'cmcunv1kz000aulcf69vwvn9m';
        
        // Get all wallet transactions for this loan
        const transactions = await prisma.walletTransaction.findMany({
            where: {
                loanId: loanId,
                type: 'LOAN_REPAYMENT',
                status: 'APPROVED'
            },
            orderBy: { createdAt: 'asc' }
        });
        
        console.log(`Found ${transactions.length} wallet transactions`);
        transactions.forEach((tx, i) => {
            console.log(`${i + 1}. ${tx.id}: ${tx.amount} on ${tx.createdAt}`);
        });
        
        if (transactions.length <= 1) {
            console.log('No duplicate transactions to remove');
            return;
        }
        
        // Keep only the first transaction (the original payment)
        const transactionsToDelete = transactions.slice(1);
        console.log(`\nDeleting ${transactionsToDelete.length} duplicate transactions...`);
        
        await prisma.$transaction(async (tx) => {
            // Delete duplicate transactions
            for (const transaction of transactionsToDelete) {
                console.log(`Deleting transaction ${transaction.id}: ${transaction.amount}`);
                await tx.walletTransaction.delete({
                    where: { id: transaction.id }
                });
            }
            
            // Reset repayment data
            console.log('Resetting loan repayment data...');
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
            
            // Recalculate with correct payment amount
            const { LateFeeProcessor } = require('./dist/src/lib/lateFeeProcessor.js');
            const paymentAmount = Math.abs(transactions[0].amount); // Use only the first transaction
            
            console.log(`Recalculating with payment amount: ${paymentAmount}`);
            
            const allocationResult = await LateFeeProcessor.handlePaymentAllocation(
                loanId,
                paymentAmount,
                new Date(transactions[0].createdAt),
                tx
            );
            
            console.log('Payment allocation result:', {
                lateFeesPaid: allocationResult.lateFeesPaid,
                principalPaid: allocationResult.principalPaid,
                remainingPayment: allocationResult.remainingPayment,
                success: allocationResult.success
            });
        });
        
        console.log('✅ Duplicate transactions fixed successfully!');
        
    } catch (error) {
        console.error('❌ Error fixing duplicate transactions:', error);
        throw error;
    }
}

fixDuplicateTransactions()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }); 