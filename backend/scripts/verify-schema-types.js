const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Define expected column types for critical fields
const EXPECTED_TYPES = {
  products: {
    lateFeeRate: 'double precision',
    interestRate: 'double precision', 
    minAmount: 'double precision',
    maxAmount: 'double precision'
  },
  loans: {
    principalAmount: 'double precision',
    totalAmount: 'double precision',
    outstandingBalance: 'double precision'
  }
};

async function verifyColumnTypes() {
  console.log('🔍 Verifying critical column types...\n');
  
  let hasErrors = false;
  
  for (const [tableName, columns] of Object.entries(EXPECTED_TYPES)) {
    console.log(`📋 Checking table: ${tableName}`);
    
    for (const [columnName, expectedType] of Object.entries(columns)) {
      try {
        const result = await prisma.$queryRaw`
          SELECT column_name, data_type, numeric_precision, numeric_scale 
          FROM information_schema.columns 
          WHERE table_name = ${tableName} AND column_name = ${columnName}
        `;
        
        if (result.length === 0) {
          console.log(`  ❌ ${columnName}: Column not found`);
          hasErrors = true;
          continue;
        }
        
        const actualType = result[0].data_type;
        
        if (actualType === expectedType) {
          console.log(`  ✅ ${columnName}: ${actualType}`);
        } else {
          console.log(`  ❌ ${columnName}: Expected '${expectedType}', got '${actualType}'`);
          if (result[0].numeric_precision && result[0].numeric_scale !== null) {
            console.log(`     Precision: ${result[0].numeric_precision}, Scale: ${result[0].numeric_scale}`);
          }
          hasErrors = true;
        }
      } catch (error) {
        console.log(`  ❌ ${columnName}: Error checking - ${error.message}`);
        hasErrors = true;
      }
    }
    console.log('');
  }
  
  if (hasErrors) {
    console.log('❌ Schema verification failed! Some columns have incorrect types.');
    console.log('💡 Run the appropriate ALTER TABLE commands to fix these issues.');
    process.exit(1);
  } else {
    console.log('✅ All critical column types are correct!');
  }
}

verifyColumnTypes()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 