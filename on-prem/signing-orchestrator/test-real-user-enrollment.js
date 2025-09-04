#!/usr/bin/env node

// =============================================================================
// Test Real User Certificate Enrollment with MTSA
// =============================================================================

const { Client } = require('pg');
const axios = require('axios');

// Configuration
const POSTGRES_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'kapital'
};

const SIGNING_ORCHESTRATOR_URL = 'http://localhost:4010';
const API_KEY = 'NwPkizAUEfShnc4meN1m3N38DG8ZNEyRmWPMjq8BXv8'; // DocuSeal API Token

async function main() {
  console.log('🧪 Testing Real User Certificate Enrollment with MTSA...\n');

  const client = new Client(POSTGRES_CONFIG);
  
  try {
    // Connect to database
    console.log('📡 Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    // Find a user with complete KYC information
    console.log('👤 Finding a suitable test user...');
    const userQuery = `
      SELECT 
        u.id,
        u."fullName",
        u.email,
        u."phoneNumber",
        u."idNumber" as nric,
        u."idType",
        u.nationality,
        u."kycStatus",
        u."isOnboardingComplete"
      FROM users u 
      WHERE 
        u."fullName" IS NOT NULL 
        AND u.email IS NOT NULL 
        AND u."idNumber" IS NOT NULL
        AND u."kycStatus" = true
        AND u."isOnboardingComplete" = true
      ORDER BY u."createdAt" DESC 
      LIMIT 5
    `;

    const result = await client.query(userQuery);
    
    if (result.rows.length === 0) {
      console.log('❌ No suitable users found with complete KYC information');
      console.log('   Requirements: fullName, email, idNumber, kycStatus=true, onboarding complete');
      return;
    }

    console.log(`✅ Found ${result.rows.length} suitable user(s):`);
    result.rows.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.fullName} (${user.nric}) - ${user.email}`);
    });

    // Use the first user for testing
    const testUser = result.rows[0];
    console.log(`\n🎯 Selected user for testing: ${testUser.fullName} (${testUser.nric})\n`);

    // Step 1: Request OTP for certificate enrollment
    console.log('📧 Step 1: Requesting OTP for certificate enrollment...');
    try {
      const otpResponse = await axios.post(`${SIGNING_ORCHESTRATOR_URL}/api/otp`, {
        userId: testUser.nric,
        usage: 'NU', // New User enrollment
        emailAddress: testUser.email
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ OTP request successful!');
      console.log(`   Status: ${otpResponse.data.success ? 'Success' : 'Failed'}`);
      console.log(`   Message: ${otpResponse.data.message}`);
      
      if (otpResponse.data.data?.statusCode) {
        console.log(`   MTSA Status Code: ${otpResponse.data.data.statusCode}`);
      }

    } catch (error) {
      console.log('❌ OTP request failed:');
      if (error.response) {
        console.log(`   HTTP Status: ${error.response.status}`);
        console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }

    // Step 2: Check certificate status
    console.log('\n🔍 Step 2: Checking existing certificate status...');
    try {
      const certResponse = await axios.get(`${SIGNING_ORCHESTRATOR_URL}/api/cert/${testUser.nric}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      console.log('✅ Certificate status check successful!');
      console.log(`   Status: ${certResponse.data.success ? 'Success' : 'Failed'}`);
      console.log(`   Message: ${certResponse.data.message}`);
      
      if (certResponse.data.data) {
        console.log(`   Certificate Status: ${certResponse.data.data.certStatus}`);
        if (certResponse.data.data.validFrom) {
          console.log(`   Valid From: ${certResponse.data.data.validFrom}`);
          console.log(`   Valid To: ${certResponse.data.data.validTo}`);
        }
      }

    } catch (error) {
      console.log('📝 Certificate status check (expected if no cert exists):');
      if (error.response) {
        console.log(`   HTTP Status: ${error.response.status}`);
        console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }

    // Step 3: Test certificate enrollment (with mock verification data)
    console.log('\n📜 Step 3: Testing certificate enrollment...');
    console.log('⚠️  Note: This will use mock verification data. In production, this would come from real eKYC.');
    
    const enrollmentData = {
      signerInfo: {
        userId: testUser.nric,
        fullName: testUser.fullName,
        emailAddress: testUser.email,
        mobileNo: testUser.phoneNumber || '60123456789',
        nationality: testUser.nationality || 'MY',
        userType: 1 // External borrower
      },
      verificationData: {
        status: 'verified',
        datetime: new Date().toISOString(),
        verifier: 'system_test',
        method: 'ekyc_with_liveness',
        evidence: {
          selfieImage: 'base64_mock_selfie_data' // In production, this would be real base64 image
        }
      }
    };

    try {
      const enrollResponse = await axios.post(`${SIGNING_ORCHESTRATOR_URL}/api/enroll`, enrollmentData, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Certificate enrollment successful!');
      console.log(`   Status: ${enrollResponse.data.success ? 'Success' : 'Failed'}`);
      console.log(`   Message: ${enrollResponse.data.message}`);
      
      if (enrollResponse.data.data?.certificateInfo) {
        const certInfo = enrollResponse.data.data.certificateInfo;
        console.log(`   Certificate Serial No: ${certInfo.serialNo}`);
        console.log(`   Valid From: ${certInfo.validFrom}`);
        console.log(`   Valid To: ${certInfo.validTo}`);
      }

    } catch (error) {
      console.log('❌ Certificate enrollment failed:');
      if (error.response) {
        console.log(`   HTTP Status: ${error.response.status}`);
        console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await client.end();
    console.log('\n📡 Database connection closed');
  }

  console.log('\n🎉 Certificate enrollment test completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. If OTP was sent successfully, check the user\'s email');
  console.log('2. For real enrollment, provide the actual OTP received');
  console.log('3. Use real eKYC verification data from your KYC system');
  console.log('4. Test the complete signing workflow with DocuSeal');
}

// Handle command line execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
