# 📄 MyTrustSigner API – Integration Summary

## Deployment Context
- **Docuseal (self-hosted, Docker)** provides the **frontend UI** and signing workflow.  
- **MyTrustSigner Agent (Docker)** runs on the **same on-prem server**, exposed only internally (SOAP Web Service).  
- Integration is done via a **Signing Orchestrator** service (your code), which:  
  - Receives **Docuseal webhooks** (e.g., signer submitted).  
  - Calls the **MyTrustSigner SOAP API**.  
  - Writes back the **signed PDF** into the on-prem storage.  

---

## Core APIs

### 1. `RequestCertificate`
Enrolls a new roaming digital certificate for a signer.  
- **Use case:** One-time certificate issuance for each signer.  
- **Inputs (main):**
  - `UserID` (NRIC / Passport)  
  - `FullName`  
  - `EmailAddress`, `MobileNo`  
  - `Nationality` (default "MY")  
  - `UserType` (1=External borrower, 2=Internal signatory)  
  - `AuthFactor` (Email OTP)  
  - ID images (NRICFront/Back or PassportImage)  
  - `SelfieImage`  
  - `VerificationData` (status, datetime, verifier, method – e.g., e-KYC with liveness)  
- **Output:**  
  - Certificate serial number, validity dates, X.509 certificate  

---

### 2. `GetCertInfo`
Check details and status of an issued certificate.  
- **Inputs:** `UserID` (NRIC/Passport).  
- **Outputs:**  
  - `certStatus` (Valid/Expired/Revoked)  
  - Validity dates  
  - Certificate X.509, issuer, subject, serial  

---

### 3. `SignPDF`
Digitally sign a PDF with a user’s certificate.  
- **Use case:** Called whenever Docuseal says “signer submitted.”  
- **Inputs (main):**
  - `UserID`, `FullName`  
  - `AuthFactor` (OTP or PIN depending on UserType)  
  - `SignatureInfo`:
    - `pdfInBase64`  
    - `visibility` (true/false; if true, requires `pageNo`, `x1,y1,x2,y2`)  
    - `sigImageInBase64` (optional visible signature image)  
  - `FieldListToUpdate`: key-value pairs for filling in form fields (supports templates like `CURR_DATE`, `SIGNER_FULLNAME`, `SIGNER_ID`).  
- **Outputs:**  
  - `signedPdfInBase64` (final signed PDF)  
  - `userCert` (signer’s certificate in X.509 format)  

---

### 4. `VerifyPDFSignature`
Validate signatures inside a signed PDF.  
- **Inputs:** `SignedPdfInBase64`  
- **Outputs:**  
  - Status code & message  
  - `totalSignatureInPdf`  
  - Signature validity details  

---

### 5. `RequestRevokeCert`
Revoke an issued certificate.  
- **Inputs:**  
  - `UserID`  
  - `CertSerialNo`  
  - `RevokeReason` (keyCompromise, CACompromise, affiliationChanged, superseded, cessationOfOperation)  
  - `RevokeBy` (Admin/Self)  
  - `AuthFactor` (OTP)  
  - Verification data and ID images  
- **Outputs:** revocation status  

---

### 6. `RequestEmailOTP`
Send a one-time password (OTP) to user’s email.  
- **Inputs:**  
  - `UserID`  
  - `OTPUsage` (`DS`=digital signing, `NU`=new cert enrolment/info update)  
  - `EmailAddress` (required for enrolment/update)  
- **Outputs:** OTP send status  

---

### 7. `UpdateEmailAddress`
Update user’s registered email.  
- **Inputs:**  
  - `UserID`  
  - `NewEmailAddress`  
  - `EmailOTP`  
- **Outputs:** status code & message  

---

### 8. `VerifyCertPin`
Check if a certificate’s PIN is valid.  
- **Inputs:**  
  - `UserID`  
  - `CertSerialNo`  
  - `CertPin`  
- **Outputs:** cert status (valid/invalid), PIN status  

---

### 9. `ResetCertificatePin`
Reset a certificate’s PIN.  
- **Inputs:**  
  - `UserID`  
  - `CertSerialNo`  
  - `NewPin`  
- **Outputs:** status code & message  

---

## Additional Technical Details

- **Environment URLs:**  
  - Pilot: `<DOMAIN:PORT>/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl`  
  - Production: `<DOMAIN:PORT>/MTSA/MyTrustSignerAgentWSAPv2?wsdl`  

- **Authentication:**  
  - SOAP header requires `Username` + `Password` (different for pilot vs production).  

- **Deployment Requirements:**  
  - JDK 17, Tomcat 9  
  - 16GB RAM, 20GB HDD  
  - Outbound access to **CRL/OCSP**, **Timestamping**, and **CA services**  

- **Signature placement:**  
  - Requires explicit coordinates if visible.  
  - Supports **with image**, **without image**, and **invisible** signatures  

- **Verification Data (compliance with DSA 1997/1998):**  
  - Must capture identity proof (NRIC/Passport), verification status, datetime, verifier, method, and evidence (selfie, docs, LoA if applicable)  

---

## Integration Flow with Docuseal

1. **Enrolment:**  
   - Docuseal captures KYC info → Orchestrator calls `RequestEmailOTP (NU)` → `RequestCertificate`.

2. **Signing:**  
   - Docuseal webhook triggers orchestrator → Orchestrator downloads unsigned PDF → calls `RequestEmailOTP (DS)` → `SignPDF`.

3. **Verification (optional):**  
   - Orchestrator can call `VerifyPDFSignature` for audit.  

4. **Revocation (if needed):**  
   - Call `RequestRevokeCert` with reason codes.

---

✅ With this setup, **Docuseal = signer UI**, **MyTrustSigner Agent = PKI/signing backend**, **your orchestrator = glue code**. Both Docuseal and MyTrustSigner run in **separate Docker containers on the same on-prem server**.  
