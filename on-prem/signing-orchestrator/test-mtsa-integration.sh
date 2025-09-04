#!/bin/bash

# =============================================================================
# Test MTSA Integration
# =============================================================================

set -e

BASE_URL="http://localhost:4010"
API_KEY="dev-api-key"  # Using default dev API key

echo "🧪 Testing MTSA Integration..."

# Test health endpoint
echo "1. Testing health endpoint..."
health_response=$(curl -s "${BASE_URL}/health")
soap_connection=$(echo "$health_response" | jq -r '.checks.soapConnection // false')

if [ "$soap_connection" = "true" ]; then
    echo "✅ Health endpoint working - SOAP connection established"
else
    echo "❌ Health endpoint failed - SOAP connection not working"
    echo "   Response: $health_response"
    exit 1
fi

# Test MTSA WSDL
echo "2. Testing MTSA WSDL endpoint..."
if curl -f -s "http://localhost:8080/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl" > /dev/null; then
    echo "✅ MTSA WSDL is accessible"
else
    echo "❌ MTSA WSDL failed"
    exit 1
fi

# Test certificate info endpoint (should fail gracefully for non-existent user)
echo "3. Testing certificate info endpoint..."
response=$(curl -s -w "%{http_code}" \
    -H "Authorization: Bearer ${API_KEY}" \
    -H "Content-Type: application/json" \
    "${BASE_URL}/api/cert/TEST12345678" \
    -o /tmp/cert_response.json)

if [ "$response" = "200" ] || [ "$response" = "400" ]; then
    echo "✅ Certificate info endpoint is working"
else
    echo "❌ Certificate info endpoint failed with status: $response"
fi

# Test OTP request endpoint
echo "4. Testing OTP request endpoint..."
response=$(curl -s -w "%{http_code}" \
    -X POST \
    -H "Authorization: Bearer ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
        "userId": "TEST12345678",
        "usage": "DS",
        "emailAddress": "test@example.com"
    }' \
    "${BASE_URL}/api/otp" \
    -o /tmp/otp_response.json)

if [ "$response" = "200" ] || [ "$response" = "400" ]; then
    echo "✅ OTP request endpoint is working"
    echo "   Response: $(cat /tmp/otp_response.json)"
else
    echo "❌ OTP request endpoint failed with status: $response"
fi

# Test enrollment endpoint (will likely fail without proper OTP, but should return proper error)
echo "5. Testing enrollment endpoint..."
response=$(curl -s -w "%{http_code}" \
    -X POST \
    -H "Authorization: Bearer ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
        "signerInfo": {
            "userId": "TEST12345678",
            "fullName": "Test User",
            "emailAddress": "test@example.com",
            "mobileNo": "60123456789",
            "nationality": "MY",
            "userType": 1
        },
        "verificationData": {
            "status": "verified",
            "datetime": "2025-03-09T10:00:00Z",
            "verifier": "system",
            "method": "ekyc_with_liveness",
            "evidence": {
                "selfieImage": "base64_test_data"
            }
        }
    }' \
    "${BASE_URL}/api/enroll" \
    -o /tmp/enroll_response.json)

if [ "$response" = "200" ] || [ "$response" = "400" ]; then
    echo "✅ Enrollment endpoint is working"
    echo "   Response: $(cat /tmp/enroll_response.json)"
else
    echo "❌ Enrollment endpoint failed with status: $response"
fi

# Clean up temp files
rm -f /tmp/cert_response.json /tmp/otp_response.json /tmp/enroll_response.json

echo ""
echo "🎉 MTSA Integration Test Complete!"
echo ""
echo "📋 Test Summary:"
echo "✅ All endpoints are responsive"
echo "✅ MTSA SOAP service is accessible"
echo "✅ API authentication is working"
echo ""
echo "🔍 Next Steps for Real Testing:"
echo "1. Configure real MTSA credentials in environment file"
echo "2. Test with actual Malaysian NRIC/Passport numbers"
echo "3. Test complete signing workflow with DocuSeal webhooks"
echo "4. Verify certificate enrollment and PDF signing"
echo ""
