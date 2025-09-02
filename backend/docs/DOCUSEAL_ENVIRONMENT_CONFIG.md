# DocuSeal Environment Configuration

## Required Environment Variables

Add these variables to your backend environment configuration:

```bash
# DocuSeal Configuration
DOCUSEAL_BASE_URL=http://your-onprem-server:8080
DOCUSEAL_API_TOKEN=your_docuseal_api_token_here
DOCUSEAL_LOAN_AGREEMENT_TEMPLATE_ID=template_id_from_docuseal
DOCUSEAL_WEBHOOK_SECRET=optional_webhook_secret_for_security

# Frontend URLs for redirects
FRONTEND_URL=https://kredit.my
```

## How to Get These Values

### 1. DOCUSEAL_BASE_URL
- For development: `http://localhost:8080`
- For production: `http://your-onprem-server-ip:8080` or `https://docuseal.yourdomain.com`

### 2. DOCUSEAL_API_TOKEN
1. Go to your DocuSeal installation: http://localhost:8080
2. Login as admin
3. Navigate to Settings → API Tokens
4. Click "Generate New Token"
5. Copy the token and add it to your environment

### 3. DOCUSEAL_LOAN_AGREEMENT_TEMPLATE_ID
1. Go to DocuSeal → Templates
2. Find your loan agreement template
3. Click on it to view details
4. Copy the template ID from the URL (e.g., `template_123abc`)

### 4. DOCUSEAL_WEBHOOK_SECRET (Optional)
- Generate a random secret for webhook security
- Use: `openssl rand -hex 32`
- Configure this same secret in DocuSeal webhook settings

## Production Deployment

### Docker Environment Files

Add to your `docker-compose.prod.yml`:

```yaml
backend:
  environment:
    - DOCUSEAL_BASE_URL=http://your-onprem-server:8080
    - DOCUSEAL_API_TOKEN=${DOCUSEAL_API_TOKEN}
    - DOCUSEAL_LOAN_AGREEMENT_TEMPLATE_ID=${DOCUSEAL_LOAN_AGREEMENT_TEMPLATE_ID}
    - DOCUSEAL_WEBHOOK_SECRET=${DOCUSEAL_WEBHOOK_SECRET}
    - FRONTEND_URL=https://kredit.my
```

### Network Configuration

Ensure your cloud backend can reach your on-premises DocuSeal server:

1. **VPN Connection**: Recommended for security
2. **Port Forwarding**: If using direct internet connection
3. **Firewall Rules**: Allow cloud server IP to access DocuSeal port
4. **DNS/IP Configuration**: Use static IP or domain name

## Testing Connection

Use the test endpoint to verify configuration:

```bash
curl -X POST http://localhost:4001/api/docuseal/test-connection \
  -H "Authorization: Bearer your_admin_token" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "message": "DocuSeal connection successful",
  "data": {
    "templatesCount": 1,
    "baseUrl": "http://localhost:8080"
  }
}
```
