# 📘 CTOS eKYC Gateway API v2.8 – Full Developer Documentation

## 🌐 Base URLs

- **UAT:** `https://uat-eonboarding.ctos.com.my/v2/gateway/`
- **Production:** `https://eonboardingsme.ctos.com.my/v2/gateway/`

---

## 🔐 Security & Authentication

- **Encryption:** AES-256-CBC  
  - Key = first 32 characters of IV + API Key  
  - IV = `MTIzNDU2Nzg5MDEy` (default)

- **Signature Generation (v2):**
  ```text
  base64(sha256(api_key + SecurityKey + package_name + ref_id + SecurityKey + request_time))
  ```

---

## 🔁 API Workflow Overview

### 1. Create Transaction
Initiates the onboarding and returns a CTOS-hosted eKYC URL for the user.

**Endpoint:** `POST /create-transaction`

#### Request Body
```json
{
  "api_key": "...",
  "package_name": "...",
  "ref_id": "...",
  "document_name": "...",
  "document_number": "...",
  "platform": "Web|iOS|Android",
  "signature": "...",
  "response_url": "...",
  "backend_url": "...",
  "callback_mode": 1,
  "document_type": 1,
  "request_time": "YYYY-MM-DD HH:mm:ss"
}
```

#### Response
```json
{
  "ref_id": "OPG_Test001",
  "onboarding_id": "xxxxxx",
  "onboarding_url": "https://onboarding.ctos.com.my/...",
  "expired_at": "YYYY-MM-DD HH:mm:ss"
}
```

---

### 2. Get Status
Retrieves the status and results of an onboarding session.

**Endpoint:** `POST /get-status`

#### Request Body
```json
{
  "api_key": "...",
  "package_name": "...",
  "ref_id": "...",
  "onboarding_id": "...",
  "platform": "Web|iOS|Android",
  "signature": "...",
  "request_time": "YYYY-MM-DD HH:mm:ss",
  "mode": 1
}
```

#### Response (Mode 2 – Detailed)
```json
{
  "status": 2,
  "result": 1,
  "step1": {
    "selfie_match": true,
    "liveness": true
  },
  "step2": {
    "name_match": true,
    "dob_match": true
  },
  "step3": {
    "sanction_screening": false
  },
  "step4": {
    "pep_screening": false
  },
  "step5": {
    "document_expiry": "2026-12-31"
  }
}
```

---

## 📡 Webhook Callback Integration

If `callback_mode` is set to `1` or `2`, CTOS will POST a status update to the provided `backend_url`.

### High-Level Webhook Flow (From Page 42)

```plaintext
+---------+       +--------------------+        +----------------------+
|         |       |                    |        |                      |
|  Client +-------> CTOS e-KYC Gateway +-------> Client’s Callback URL|
|         |       |                    |        |                      |
+----+----+       +---------+----------+        +----------+-----------+
     |                      |                              |
     |   Create Transaction |                              |
     |--------------------->|                              |
     |                      |                              |
     |                      |       Postback (Webhook)     |
     |                      |----------------------------->|
     |                      |                              |
     |                      |<-----------------------------|
     |                      |        (200 OK Response)     |
     |                      |                              |
```

- **Callback Ports Allowed:** 80 or 443
- **Mode Options:**
  - `0`: No callback
  - `1`: Summary (recommended)
  - `2`: Detailed

---

## 🔄 Status & Result Codes

- **Status:**
  | Code | Meaning       |
  |------|---------------|
  | 0    | Not Opened    |
  | 1    | Processing    |
  | 2    | Completed     |
  | 3    | Expired       |

- **Result:**
  | Code | Meaning         |
  |------|-----------------|
  | 0    | Rejected        |
  | 1    | Approved        |
  | 2    | Not Available   |

---

## 🧪 Postman Collection Notes

- **Variables Used:**
  - `api_key`, `package_name`, `ref_id`, `request_time`, `document_name`, `document_number`, `platform`, `response_url`, `backend_url`, `callback_mode`, `document_type`, `iv`, `key`

- **Automation Includes:**
  - Pre-request scripts (signature, encryption)
  - Test scripts (decryption, logging)

---

This documentation is tailored for integration via server-side applications and Postman-based testing environments.
