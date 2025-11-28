# MTSA Certificate Enrollment Request - User 720227085033

## Request Metadata
- **Timestamp**: 2025-11-28T03:21:34.067Z
- **Correlation ID**: 8e7575fc9412686b9a96e7451bb0b351
- **Request Length**: 83,315 bytes
- **Response Length**: 373 bytes
- **Status**: ❌ FAILED

## User Information
```json
{
  "UserID": "720227085033",
  "FullName": "Soo Keong Joo\n",  // ⚠️ Note: Contains newline character
  "EmailAddress": "kjsooco@hotmail.com",
  "MobileNo": "+60124026877",
  "Nationality": "MY",
  "UserType": "2",  // Internal user (requires OrganisationInfo)
  "IDType": "N"     // NRIC
}
```

## Authentication
```json
{
  "AuthFactor": "OTP/PIN value" // Redacted in logs
}
```

## KYC Images (Base64)
```json
{
  "NRICFront": "... base64 encoded image ...",  // ~27-40KB
  "NRICBack": "... base64 encoded image ...",   // ~27-40KB
  "SelfieImage": "... base64 encoded image ..." // ~27-40KB
}
```
Total images size: ~81-120KB (explaining the 83KB total request size)

## Organisation Information
**⚠️ ISSUE IDENTIFIED: Missing or Invalid `orgUserRegistrationType`**

Based on the codebase, the `OrganisationInfo` structure should be:

```json
{
  "OrganisationInfo": {
    "orgName": "string",                        // Organisation Name
    "orgUserDesignation": "string",             // User's Designation (e.g., Director, Manager)
    "orgUserRegistrationNo": "string",          // Professional/Employee ID
    "orgUserRegistrationType": "E" | "P",       // ❌ THIS IS THE FAILING FIELD
                                                 // E = Employee ID
                                                 // P = Professional Registration
    "orgAddress": "string",                     // Full address
    "orgAddressCity": "string",                 // City
    "orgAddressState": "string",                // State
    "orgAddressPostcode": "string",             // 5-digit postcode
    "orgRegistationNo": "string",               // Company registration number (max 20 chars)
    "orgPhoneNo": "string"                      // Phone number
  }
}
```

## Verification Data
```json
{
  "VerificationData": {
    "verifyStatus": "Approved",
    "verifyDatetime": "2025-11-28 11:21:33",  // Format: yyyy-MM-dd HH:mm:ss
    "verifyVerifier": "CTOS",
    "verifyMethod": "e-KYC"
  }
}
```

## SOAP Request Structure
```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" 
               xmlns:tns="http://mtsa.msctg.com/">
  <soap:Body>
    <tns:RequestCertificate>
      <UserID>720227085033</UserID>
      <FullName>Soo Keong Joo\n</FullName>
      <EmailAddress>kjsooco@hotmail.com</EmailAddress>
      <MobileNo>+60124026877</MobileNo>
      <Nationality>MY</Nationality>
      <UserType>2</UserType>
      <IDType>N</IDType>
      <AuthFactor>[PIN/OTP REDACTED]</AuthFactor>
      <NRICFront>[BASE64 IMAGE DATA ~27-40KB]</NRICFront>
      <NRICBack>[BASE64 IMAGE DATA ~27-40KB]</NRICBack>
      <SelfieImage>[BASE64 IMAGE DATA ~27-40KB]</SelfieImage>
      <OrganisationInfo>
        <orgName>[VALUE SENT]</orgName>
        <orgUserDesignation>[VALUE SENT]</orgUserDesignation>
        <orgUserRegistrationNo>[VALUE SENT]</orgUserRegistrationNo>
        <orgUserRegistrationType>[MISSING OR INVALID]</orgUserRegistrationType>
        <orgAddress>[VALUE SENT]</orgAddress>
        <orgAddressCity>[VALUE SENT]</orgAddressCity>
        <orgAddressState>[VALUE SENT]</orgAddressState>
        <orgAddressPostcode>[VALUE SENT]</orgAddressPostcode>
        <orgRegistationNo>[VALUE SENT]</orgRegistationNo>
        <orgPhoneNo>[VALUE SENT]</orgPhoneNo>
      </OrganisationInfo>
      <VerificationData>
        <verifyStatus>Approved</verifyStatus>
        <verifyDatetime>2025-11-28 11:21:33</verifyDatetime>
        <verifyVerifier>CTOS</verifyVerifier>
        <verifyMethod>e-KYC</verifyMethod>
      </VerificationData>
    </tns:RequestCertificate>
  </soap:Body>
</soap:Envelope>
```

## SOAP Response (Error)
```xml
<?xml version='1.0' encoding='UTF-8'?>
<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
  <S:Body>
    <ns2:RequestCertificateResponse xmlns:ns2="http://mtsa.msctg.com/">
      <return>
        <statusCode>AP104</statusCode>
        <statusMsg>Error in parameter validation: OrganisationInfo.OrgUserRegistrationType</statusMsg>
      </return>
    </ns2:RequestCertificateResponse>
  </S:Body>
</S:Envelope>
```

## Root Cause Analysis

### Error Code: AP104
**Error Message**: "Error in parameter validation: OrganisationInfo.OrgUserRegistrationType"

### Possible Causes:

1. **Missing Field**: The `orgUserRegistrationType` field is not being included in the request
   - Frontend default value is 'E' (Employee ID) based on code at line 86-93 of `admin/app/dashboard/settings/signing/page.tsx`
   - The field should be populated, so this is less likely

2. **Invalid Value**: The field contains a value other than 'E' or 'P'
   - Could be empty string, null, or undefined
   - Could be a different value not accepted by MTSA

3. **Field Name Mismatch**: MTSA API expects a different field name
   - Frontend sends: `orgUserRegistrationType`
   - MTSA might expect: `OrgUserRegistrationType` (capital O)
   - Or a completely different name

4. **Additional Data Issue**: The FullName contains a newline character `\n`
   - `"FullName": "Soo Keong Joo\n"`
   - This might be causing parsing issues

### Recommended Fixes:

1. **Check the actual value being sent**: Add logging to capture the full `organisationInfo` object before sending
2. **Validate field name casing**: Ensure the SOAP client preserves the exact field names
3. **Remove newline from FullName**: Strip whitespace/newlines before sending:
   ```typescript
   fullName: fullName.trim()
   ```
4. **Verify MTSA API specification**: Confirm the exact field name and allowed values for `OrgUserRegistrationType`
5. **Add validation**: Ensure `orgUserRegistrationType` is always 'E' or 'P' before submission

## Data Flow

```
Frontend (admin/app/dashboard/settings/signing/page.tsx)
    ↓ POST /api/admin/mtsa/request-certificate
Backend (backend/src/api/admin/mtsa.ts)
    ↓ Forward to Signing Orchestrator
Signing Orchestrator (on-prem/signing-orchestrator/src/routes/api.ts)
    ↓ SOAP Call via MTSAClient
MTSA API (mtsa.msctg.com)
    ↓ Response
    ❌ AP104 Error: OrganisationInfo.OrgUserRegistrationType validation failed
```

## Next Steps

1. Review the frontend form submission for user `720227085033`
2. Check if `orgUserRegistrationType` has a value at submission time
3. Add debug logging in the signing orchestrator to log the full `OrganisationInfo` before SOAP serialization
4. Contact MTSA support for exact API specification if field name/values are unclear
5. Fix the newline issue in `FullName` field

