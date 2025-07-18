const axios = require('axios');

// Configuration - WhatsApp API
const WHATSAPP_API_URL = 'https://graph.facebook.com/v22.0';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Test data
const testData = {
	to: '+60111111111', // This should be in your allowlist
	fullName: 'John Doe',
	amount: '50000.00',
	productName: 'SME Term Loan',
	firstRepaymentDate: 'August 18, 2025'
};

async function testLoanDisbursementNotification() {
	try {
		console.log('Testing WhatsApp Loan Disbursement Notification...');
		console.log('Test data:', testData);

		if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
			console.error('❌ WhatsApp credentials not configured');
			console.log('Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables');
			return;
		}

		// Remove any '+' prefix from phone number for WhatsApp API
		const cleanPhoneNumber = testData.to.replace(/^\+/, '');
		const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

		// Build the loan disbursement notification payload
		const payload = {
			messaging_product: 'whatsapp',
			recipient_type: 'individual',
			to: cleanPhoneNumber,
			type: 'template',
			template: {
				name: 'loan_disburse',
				language: {
					code: 'en'
				},
				components: [
					{
						type: 'body',
						parameters: [
							{
								type: 'text',
								text: testData.fullName
							},
							{
								type: 'text',
								text: testData.amount
							},
							{
								type: 'text',
								text: testData.productName
							},
							{
								type: 'text',
								text: testData.firstRepaymentDate
							}
						]
					}
				]
			}
		};

		console.log('\nSending WhatsApp message...');
		console.log('Payload:', JSON.stringify(payload, null, 2));

		const response = await axios.post(url, payload, {
			headers: {
				'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
				'Content-Type': 'application/json'
			}
		});

		console.log('\n✅ WhatsApp API Response:', response.data);

		if (response.data.messages && response.data.messages[0]) {
			console.log(`\n🎉 Success! Message sent with ID: ${response.data.messages[0].id}`);
			console.log(`📱 Check WhatsApp on ${testData.to} for the loan disbursement notification`);
		} else {
			console.log('❌ No message ID returned');
		}

	} catch (error) {
		console.error('\n❌ Error sending WhatsApp notification:', error.response?.data || error.message);
		
		if (error.response?.data?.error?.code === 131030) {
			console.log('\n💡 Note: The recipient phone number needs to be added to your WhatsApp Business account allowlist during development.');
			console.log('   Go to WhatsApp Business Manager → Account Tools → Phone Numbers → Configure → Message Templates');
		}
	}
}

// Expected message format:
console.log('📋 Expected WhatsApp message format:');
console.log(`Hi, ${testData.fullName}. RM ${testData.amount} has been successfully disbursed to your registered bank account for your ${testData.productName} loan.`);
console.log(`Your first repayment is due on ${testData.firstRepaymentDate}.`);
console.log('\n' + '='.repeat(80));

testLoanDisbursementNotification(); 