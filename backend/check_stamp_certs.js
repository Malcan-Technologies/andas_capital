const { prisma } = require('./dist/src/lib/prisma');

async function check() {
  // Check database references
  const loans = await prisma.loan.findMany({
    where: { pkiStampCertificateUrl: { not: null } },
    select: {
      id: true,
      applicationId: true,
      pkiStampCertificateUrl: true,
      user: { select: { fullName: true } }
    }
  });
  
  console.log('\n📊 Loans with stamp certificates in database:', loans.length);
  loans.forEach(loan => {
    console.log(`  - Loan: ${loan.id.substring(0, 8)}, User: ${loan.user.fullName}, Path: ${loan.pkiStampCertificateUrl}`);
  });
  
  // Check document audit logs
  const auditLogs = await prisma.documentAuditLog.findMany({
    where: { documentType: 'STAMP_CERTIFICATE' },
    select: {
      fileName: true,
      loanId: true,
      userName: true,
      isOrphaned: true
    }
  });
  
  console.log('\n📋 Document audit logs for stamp certificates:', auditLogs.length);
  if (auditLogs.length > 0) {
    auditLogs.forEach(log => {
      console.log(`  - ${log.fileName}, Loan: ${log.loanId?.substring(0, 8) || 'none'}, User: ${log.userName || 'none'}, Orphaned: ${log.isOrphaned}`);
    });
  } else {
    console.log('  ⚠️  No stamp certificate audit logs found. Run document scan!');
  }
  
  await prisma.$disconnect();
}

check().catch(console.error);
