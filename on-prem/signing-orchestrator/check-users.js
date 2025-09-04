#!/usr/bin/env node

const { Client } = require('pg');

const POSTGRES_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'kapital'
};

async function checkUsers() {
  const client = new Client(POSTGRES_CONFIG);
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check total users
    const totalQuery = 'SELECT COUNT(*) as total FROM users';
    const totalResult = await client.query(totalQuery);
    console.log(`📊 Total users in database: ${totalResult.rows[0].total}\n`);

    if (totalResult.rows[0].total === '0') {
      console.log('❌ No users found in database');
      return;
    }

    // Check users with basic info
    const basicQuery = `
      SELECT 
        u.id,
        u."fullName",
        u.email,
        u."phoneNumber",
        u."idNumber",
        u."kycStatus",
        u."isOnboardingComplete",
        u."createdAt"
      FROM users u 
      ORDER BY u."createdAt" DESC 
      LIMIT 10
    `;

    const result = await client.query(basicQuery);
    
    console.log('📋 Recent users (showing up to 10):');
    console.log('─'.repeat(120));
    console.log('Name                    | Email                | Phone           | ID Number     | KYC | Onboarding | Created');
    console.log('─'.repeat(120));
    
    result.rows.forEach((user, index) => {
      const name = (user.fullName || 'N/A').substring(0, 20).padEnd(20);
      const email = (user.email || 'N/A').substring(0, 18).padEnd(18);
      const phone = (user.phoneNumber || 'N/A').substring(0, 13).padEnd(13);
      const idNumber = (user.idNumber || 'N/A').substring(0, 11).padEnd(11);
      const kyc = user.kycStatus ? 'Yes' : 'No ';
      const onboarding = user.isOnboardingComplete ? 'Yes' : 'No ';
      const created = new Date(user.createdAt).toISOString().split('T')[0];
      
      console.log(`${name} | ${email} | ${phone} | ${idNumber} | ${kyc} | ${onboarding}      | ${created}`);
    });

    console.log('─'.repeat(120));

    // Find best candidate for testing
    const candidateQuery = `
      SELECT 
        u.id,
        u."fullName",
        u.email,
        u."phoneNumber",
        u."idNumber",
        u."kycStatus",
        u."isOnboardingComplete"
      FROM users u 
      WHERE 
        u."fullName" IS NOT NULL 
        AND u.email IS NOT NULL 
        AND u."phoneNumber" IS NOT NULL
      ORDER BY 
        CASE WHEN u."kycStatus" = true THEN 1 ELSE 2 END,
        CASE WHEN u."isOnboardingComplete" = true THEN 1 ELSE 2 END,
        u."createdAt" DESC 
      LIMIT 1
    `;

    const candidateResult = await client.query(candidateQuery);
    
    if (candidateResult.rows.length > 0) {
      const candidate = candidateResult.rows[0];
      console.log('\n🎯 Best candidate for testing:');
      console.log(`   Name: ${candidate.fullName}`);
      console.log(`   Email: ${candidate.email}`);
      console.log(`   Phone: ${candidate.phoneNumber}`);
      console.log(`   ID Number: ${candidate.idNumber || 'Not set'}`);
      console.log(`   KYC Status: ${candidate.kycStatus ? 'Completed' : 'Pending'}`);
      console.log(`   Onboarding: ${candidate.isOnboardingComplete ? 'Complete' : 'Incomplete'}`);
      
      if (!candidate.idNumber) {
        console.log('\n⚠️  This user needs an ID number for MTSA certificate enrollment');
        console.log('   You can manually update it in the database or create a test user');
      }
    } else {
      console.log('\n❌ No suitable candidates found with basic information');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.end();
  }
}

checkUsers().catch(console.error);
