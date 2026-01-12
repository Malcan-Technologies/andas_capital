# Variables for Terraform
# Most configuration is loaded from client.json, but these can be overridden

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS (optional, can be added later)"
  type        = string
  default     = ""
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection on critical resources"
  type        = bool
  default     = false
}
