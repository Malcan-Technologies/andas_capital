# Secrets Module - AWS Secrets Manager

variable "secrets_prefix" {
  description = "Prefix for secrets (e.g., client_slug/env)"
  type        = string
}

variable "client_slug" {
  description = "Client identifier"
  type        = string
}

# Placeholder secrets - these will be manually populated
# The actual secret values should NEVER be in Terraform state

# JWT Secret
resource "aws_secretsmanager_secret" "jwt_secret" {
  name = "${var.secrets_prefix}/jwt-secret"

  tags = {
    Client = var.client_slug
  }
}

# JWT Refresh Secret (for refresh tokens)
resource "aws_secretsmanager_secret" "jwt_refresh_secret" {
  name = "${var.secrets_prefix}/jwt-refresh-secret"

  tags = {
    Client = var.client_slug
  }
}

# DocuSeal & Signing Orchestrator Configuration (combined)
# JSON keys: api_token, base_url, api_url, template_id, webhook_secret, orchestrator_url, orchestrator_api_key
resource "aws_secretsmanager_secret" "docuseal_signing_config" {
  name = "${var.secrets_prefix}/docuseal-signing-config"

  tags = {
    Client = var.client_slug
  }
}

# WhatsApp API Token
resource "aws_secretsmanager_secret" "whatsapp_token" {
  name = "${var.secrets_prefix}/whatsapp-api-token"

  tags = {
    Client = var.client_slug
  }
}

# Resend API Key
resource "aws_secretsmanager_secret" "resend_api_key" {
  name = "${var.secrets_prefix}/resend-api-key"

  tags = {
    Client = var.client_slug
  }
}

# CTOS eKYC API credentials
# IMPORTANT: JSON keys MUST be lowercase with underscores:
# {
#   "api_key": "...",
#   "package_name": "...",
#   "security_key": "...",
#   "base_url": "https://uat-eonboarding.ctos.com.my",
#   "webhook_url": "https://api.{domain}/api/ctos/webhook",
#   "ciphertext": "...",
#   "cipher": "aes-256-cbc"
# }
resource "aws_secretsmanager_secret" "ctos_credentials" {
  name        = "${var.secrets_prefix}/ctos-credentials"
  description = "CTOS eKYC credentials. Keys: api_key, package_name, security_key, base_url, webhook_url, ciphertext, cipher (all lowercase)"

  tags = {
    Client = var.client_slug
  }
}

# CTOS B2B Credit Report credentials
# IMPORTANT: JSON keys MUST be lowercase with underscores:
# {
#   "company_code": "...",
#   "account_no": "...",
#   "user_id": "...",
#   "client_id": "...",
#   "sso_password": "...",
#   "sso_url": "https://uat-sso.ctos.com.my",
#   "api_url": "https://uat-integration.ctos.com.my",
#   "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
# }
resource "aws_secretsmanager_secret" "ctos_b2b_credentials" {
  name        = "${var.secrets_prefix}/ctos-b2b-credentials"
  description = "CTOS B2B credit report credentials. Keys: company_code, account_no, user_id, client_id, sso_password, sso_url, api_url, private_key (all lowercase)"

  tags = {
    Client = var.client_slug
  }
}

# Cloudflare Tunnel Token
resource "aws_secretsmanager_secret" "cloudflare_tunnel_token" {
  name = "${var.secrets_prefix}/cloudflare-tunnel-token"

  tags = {
    Client = var.client_slug
  }
}

# Outputs
output "secret_arns" {
  value = {
    jwt_secret               = aws_secretsmanager_secret.jwt_secret.arn
    jwt_refresh_secret       = aws_secretsmanager_secret.jwt_refresh_secret.arn
    docuseal_signing_config  = aws_secretsmanager_secret.docuseal_signing_config.arn
    whatsapp_token           = aws_secretsmanager_secret.whatsapp_token.arn
    resend_api_key           = aws_secretsmanager_secret.resend_api_key.arn
    ctos_credentials         = aws_secretsmanager_secret.ctos_credentials.arn
    ctos_b2b_credentials     = aws_secretsmanager_secret.ctos_b2b_credentials.arn
    cloudflare_tunnel_token  = aws_secretsmanager_secret.cloudflare_tunnel_token.arn
  }
}

output "secrets_prefix" {
  value = var.secrets_prefix
}
