#!/usr/bin/env node

const { Client } = require('pg');

const POSTGRES_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'kapital'
};

// Test Malaysian NRIC number (valid format but fake)
const TEST_NRIC = '901201011234'; // Format: YYMMDD-PB-####
const TEST_ID_TYPE = 'NRIC';

async function updateTestUser() {
  const client = new Client(POSTGRES_CONFIG);
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Find Ivan's user record
    const findUserQuery = `
      SELECT id, "fullName", email, "phoneNumber", "idNumber" 
      FROM users 
      WHERE "fullName" = 'Ivan Chew Ken Yoong'
    `;

    const userResult = await client.query(findUserQuery);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User Ivan Chew Ken Yoong not found');
      return;
    }

    const user = userResult.rows[0];
    console.log('👤 Found user:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.fullName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Phone: ${user.phoneNumber}`);
    console.log(`   Current ID Number: ${user.idNumber || 'Not set'}\n`);

    if (user.idNumber) {
      console.log('⚠️  User already has an ID number. Do you want to proceed? (y/N)');
      console.log('   This will overwrite the existing ID number for testing purposes.');
      console.log('   Press Ctrl+C to cancel or continue to proceed...\n');
      
      // Give user a chance to cancel
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Update the user with test NRIC
    const updateQuery = `
      UPDATE users 
      SET 
        "idNumber" = $1,
        "idType" = $2,
        nationality = 'MY',
        "updatedAt" = NOW()
      WHERE id = $3
      RETURNING "fullName", "idNumber", "idType", nationality
    `;

    console.log('🔄 Updating user with test NRIC for MTSA testing...');
    const updateResult = await client.query(updateQuery, [TEST_NRIC, TEST_ID_TYPE, user.id]);
    
    if (updateResult.rows.length > 0) {
      const updated = updateResult.rows[0];
      console.log('✅ User updated successfully!');
      console.log(`   Name: ${updated.fullName}`);
      console.log(`   ID Number: ${updated.idNumber}`);
      console.log(`   ID Type: ${updated.idType}`);
      console.log(`   Nationality: ${updated.nationality}\n`);
      
      console.log('🎉 User is now ready for MTSA certificate enrollment testing!');
      console.log('\n📋 Next Steps:');
      console.log('1. Run: node test-real-user-enrollment.js');
      console.log('2. Check email for OTP verification');
      console.log('3. Test complete certificate enrollment workflow');
      
      console.log('\n⚠️  Important Notes:');
      console.log('• This is a TEST NRIC number for development only');
      console.log('• For production, use real verified NRIC numbers');
      console.log('• The MTSA pilot environment may have restrictions on test IDs');
    } else {
      console.log('❌ Failed to update user');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.end();
    console.log('\n📡 Database connection closed');
  }
}

updateTestUser().catch(console.error);
