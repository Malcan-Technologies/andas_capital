const soap = require('soap');

async function testMTSADirectCall() {
    try {
        console.log('Creating SOAP client...');
        const client = await soap.createClientAsync('http://localhost:8080/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl');
        
        // Set HTTP headers for authentication
        console.log('Setting HTTP headers...');
        client.addHttpHeader('Username', 'opg_capital_pilot');
        client.addHttpHeader('Password', 'YcuLxvMMcXWPLRaW');
        
        // Enable SOAP request/response logging
        client.on('request', (xml) => {
            console.log('SOAP Request XML:', xml);
        });
        
        client.on('response', (xml) => {
            console.log('SOAP Response XML:', xml);
        });
        
        console.log('Making RequestEmailOTP call...');
        
        const result = await new Promise((resolve, reject) => {
            client.RequestEmailOTP({
                UserID: '891114075601',
                EmailAddress: 'ivan.chewky@gmail.com',
                OTPUsage: 'NU'
            }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        
        console.log('MTSA Response:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        if (error.body) {
            console.error('SOAP Body:', error.body);
        }
    }
}

testMTSADirectCall();
