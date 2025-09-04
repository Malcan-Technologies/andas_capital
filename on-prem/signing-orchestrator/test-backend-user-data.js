const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:4001';

async function testBackendUserData() {
  console.log('🧪 Testing Backend User Data in Loan Applications');

  try {
    // First, let's get the loan applications to find a suitable one
    console.log('\n1. Fetching loan applications...');
    
    // We need to authenticate first - use a test user token
    // For testing purposes, we'll try to get an application directly
    // In a real test, you'd authenticate first

    // Let's try getting an application by ID directly
    const applicationId = 'your-test-application-id'; // You'll need to replace this
    
    const response = await fetch(`${API_BASE_URL}/api/loan-applications/${applicationId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer your-test-token', // You'll need a valid token
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const application = await response.json();
      
      console.log('\n✅ Successfully fetched application with user data:');
      console.log('Application ID:', application.id);
      console.log('User data available:');
      console.log('- Full Name:', application.user?.fullName || 'Missing');
      console.log('- Email:', application.user?.email || 'Missing');
      console.log('- Phone Number:', application.user?.phoneNumber || 'Missing');
      console.log('- IC Number:', application.user?.icNumber || 'Missing');
      console.log('- IC Type:', application.user?.icType || 'Missing');
      console.log('- Address:', application.user?.address1 || 'Missing');
      console.log('- City:', application.user?.city || 'Missing');
      console.log('- State:', application.user?.state || 'Missing');
      
      // Check if we have all required fields for MTSA
      const userIdNumber = application.user?.icNumber;
      const userEmail = application.user?.email;
      const userPhone = application.user?.phoneNumber;
      
      if (userIdNumber && userEmail && userPhone) {
        console.log('\n✅ All required fields for MTSA are present!');
        console.log('- User ID (IC):', userIdNumber);
        console.log('- Email:', userEmail);  
        console.log('- Phone:', userPhone);
      } else {
        console.log('\n❌ Missing required fields for MTSA:');
        if (!userIdNumber) console.log('- Missing IC Number');
        if (!userEmail) console.log('- Missing Email');
        if (!userPhone) console.log('- Missing Phone Number');
      }
      
    } else {
      const error = await response.text();
      console.log(`❌ Failed to fetch application: ${response.status} - ${error}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing backend user data:', error.message);
  }
}

// Note: This test requires valid authentication and application ID
console.log('📝 Note: This test requires:');
console.log('1. A valid user authentication token');
console.log('2. A valid loan application ID');
console.log('3. Backend server running on localhost:4001');
console.log('\nTo run a real test:');
console.log('1. Get a user token from login');
console.log('2. Get an application ID from the user\'s applications');
console.log('3. Update the token and applicationId variables above');
console.log('4. Run: node test-backend-user-data.js');

// testBackendUserData();
