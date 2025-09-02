#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createTestLoanApplication(loanAmount = 18000, loanTerm = 6) {
  try {
    console.log('🚀 Creating test loan application...');

    // Get the PayAdvance product (assuming it exists)
    const payAdvanceProduct = await prisma.product.findFirst({
      where: {
        code: { contains: 'payadvance', mode: 'insensitive' }
      }
    });

    if (!payAdvanceProduct) {
      console.error('❌ PayAdvance product not found. Available products:');
      const products = await prisma.product.findMany({
        select: { code: true, name: true, id: true }
      });
      console.log(products);
      return;
    }

    console.log(`✅ Found PayAdvance product: ${payAdvanceProduct.name} (${payAdvanceProduct.code})`);

    // Get the test user (assuming phone number +60182440976 exists)
    const testUser = await prisma.user.findFirst({
      where: { phoneNumber: '+60182440976' }
    });

    if (!testUser) {
      console.error('❌ Test user with phone +60182440976 not found');
      return;
    }

    console.log(`✅ Found test user: ${testUser.fullName || testUser.phoneNumber}`);

    // Calculate loan terms
    const amount = loanAmount;
    const term = loanTerm;
    const interestRate = payAdvanceProduct.interestRate;
    const monthlyInterest = interestRate / 100 / 12;
    const monthlyPayment = (amount * monthlyInterest * Math.pow(1 + monthlyInterest, term)) / 
                          (Math.pow(1 + monthlyInterest, term) - 1);

    const applicationFee = payAdvanceProduct.applicationFee;
    const originationFee = payAdvanceProduct.originationFee;
    const legalFee = payAdvanceProduct.legalFee;
    const totalFees = applicationFee + originationFee + legalFee;
    const netDisbursement = amount - totalFees;

    // Generate unique URL link
    const urlLink = crypto.randomBytes(16).toString('hex');

    // Create the application with PENDING_ATTESTATION status
    const application = await prisma.loanApplication.create({
      data: {
        userId: testUser.id,
        productId: payAdvanceProduct.id,
        amount: amount,
        term: term,
        status: 'PENDING_ATTESTATION',
        interestRate: interestRate,
        monthlyRepayment: Math.round(monthlyPayment * 100) / 100,
        applicationFee: applicationFee,
        originationFee: originationFee,
        legalFee: legalFee,
        netDisbursement: Math.round(netDisbursement * 100) / 100,
        urlLink: urlLink,
        appStep: 10, // Completed application
        acceptTerms: true,
        paidAppFee: true,
        purpose: 'Test loan for DocuSeal integration testing'
      }
    });

    // Create application history
    await prisma.loanApplicationHistory.create({
      data: {
        applicationId: application.id,
        previousStatus: null,
        newStatus: 'PENDING_ATTESTATION',
        changedBy: 'SYSTEM_SCRIPT',
        changeReason: 'Test loan created for DocuSeal integration testing',
        notes: `Created test loan: ${amount} MYR for ${term} months`,
        metadata: {
          scriptGenerated: true,
          createdAt: new Date().toISOString(),
          loanDetails: {
            amount,
            term,
            interestRate,
            monthlyPayment: Math.round(monthlyPayment * 100) / 100
          }
        }
      }
    });

    console.log('\n🎉 Test loan application created successfully!');
    console.log('📋 Application Details:');
    console.log(`   ID: ${application.id}`);
    console.log(`   Amount: RM ${amount.toLocaleString()}`);
    console.log(`   Term: ${term} months`);
    console.log(`   Interest Rate: ${interestRate}%`);
    console.log(`   Monthly Payment: RM ${Math.round(monthlyPayment * 100) / 100}`);
    console.log(`   Net Disbursement: RM ${Math.round(netDisbursement * 100) / 100}`);
    console.log(`   Status: ${application.status}`);
    console.log(`   User: ${testUser.fullName || testUser.phoneNumber}`);
    console.log(`   URL Link: ${urlLink}`);
    
    console.log('\n🔄 Next Steps:');
    console.log('1. Go to admin panel to complete attestation');
    console.log('2. Status will change to PENDING_SIGNATURE');
    console.log('3. Loan and repayment schedule will be created');
    console.log('4. DocuSeal signing process will be initiated');

    return application;

  } catch (error) {
    console.error('❌ Error creating test loan application:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  // Parse command line arguments for amount and term
  const args = process.argv.slice(2);
  let amount = 18000;
  let term = 6;
  
  if (args.length >= 1) amount = parseFloat(args[0]);
  if (args.length >= 2) term = parseInt(args[1]);
  
  console.log(`Creating loan with amount: RM ${amount}, term: ${term} months`);
  createTestLoanApplication(amount, term);
}

module.exports = { createTestLoanApplication };
