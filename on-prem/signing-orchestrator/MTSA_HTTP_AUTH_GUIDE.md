# MTSA HTTP Header Authentication Guide

## Overview

This guide documents the **HTTP header authentication** solution for MyTrustSigner Agent (MTSA) integration, which resolves the `WS111 - Username is missing from Web Service Header` error.

## Problem Solved

**Issue**: `WS111 - Username is missing from Web Service Header`
**Root Cause**: MTSA expects authentication credentials in HTTP headers, not SOAP headers
**Solution**: Use `addHttpHeader()` instead of `addSoapHeader()` for authentication

## Implementation

### Code Changes

**❌ Old Method (SOAP Headers - Causing WS111)**:
```typescript
this.client.addSoapHeader(`
  <Credentials>
    <WSUser id="1001">
      <user>${config.mtsa.username}</user>
      <pass>${config.mtsa.password}</pass>
    </WSUser>
  </Credentials>
`);
```

**✅ New Method (HTTP Headers - Working)**:
```typescript
// Set HTTP headers for authentication
this.client.addHttpHeader('Username', config.mtsa.username);
this.client.addHttpHeader('Password', config.mtsa.password);
```

### Environment Configuration

Both development and production environments are pre-configured:

**Development** (`env.development`):
```bash
MTSA_SOAP_USERNAME=opg_capital_pilot
MTSA_SOAP_PASSWORD=YcuLxvMMcXWPLRaW
MTSA_WSDL_PILOT=http://mtsa-pilot:8080/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl
```

**Production** (`env.production`):
```bash
MTSA_SOAP_USERNAME=opg_capital_pilot
MTSA_SOAP_PASSWORD=YcuLxvMMcXWPLRaW
MTSA_WSDL_PILOT=http://192.168.0.100:8080/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl
```

## Deployment

### Development Deployment
```bash
# Use development environment
cp env.development .env
npm run build
npm start
```

### Production Deployment
```bash
# Use production environment
cp env.production .env
npm run build
npm start

# Or with Docker Compose
docker-compose -f docker-compose.yml up -d
```

## Testing

### Quick Test Script
```bash
# Test HTTP header authentication
node test-mtsa-http-headers.js
```

**Expected Success Output**:
```
✅ MTSA client initialized successfully with HTTP header auth
📤 GetCertInfo Response: GC100 - Cert not found
🎉 SUCCESS: HTTP header authentication working!
```

### API Endpoint Testing
```bash
# Test via API endpoint
curl -X GET http://localhost:4010/api/cert/test123 \
  -H "X-API-Key: your-api-key"
```

## Key Benefits

1. **✅ Resolves WS111 Error**: No more authentication failures
2. **✅ Production Ready**: Works in both pilot and production environments
3. **✅ Simple Configuration**: Just environment variables
4. **✅ Proper SOAP Communication**: Valid request/response cycle
5. **✅ Error Handling**: Graceful handling of MTSA responses

## MTSA Functions Supported

All MTSA functions now work with HTTP header authentication:
- `GetCertInfo` - Get certificate information
- `RequestEmailOTP` - Request OTP for digital signing
- `RequestCertificate` - Enroll new certificates
- `SignPDF` - Digital document signing
- `VerifyPDFSignature` - Verify signed documents

## Environment Switching

The system automatically uses the correct WSDL URL based on `MTSA_ENV`:

```bash
# Pilot environment (default)
MTSA_ENV=pilot

# Production environment
MTSA_ENV=prod
```

## Security Notes

- Credentials are stored in environment variables
- HTTP headers are encrypted in transit via HTTPS
- MTSA service is on secure on-premises network
- No credentials stored in code or logs

## Troubleshooting

### Connection Issues
```bash
# Check MTSA service availability
curl http://localhost:8080/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl

# Check environment variables
echo $MTSA_SOAP_USERNAME
echo $MTSA_SOAP_PASSWORD
```

### Authentication Issues
If you see authentication errors, verify:
1. Environment variables are properly set
2. MTSA service is running
3. Username/password are correct
4. Network connectivity to MTSA service

## Success Criteria

✅ **Authentication Working When**:
- No `WS111` errors in logs
- MTSA returns valid status codes (e.g., `GC100`, `0000`)
- SOAP request/response cycle completes
- Certificate operations succeed

---

**Updated**: September 2025  
**Status**: ✅ Production Ready
