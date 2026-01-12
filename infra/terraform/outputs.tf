# Consolidated Outputs
# These outputs are useful for CI/CD and debugging

output "client_slug" {
  description = "Client identifier"
  value       = local.config.client_slug
}

output "environment" {
  description = "Environment name"
  value       = local.config.environment
}

output "domains" {
  description = "Domain configuration"
  value       = local.config.domains
}

output "cloudflare_cname_target" {
  description = "CNAME target for Cloudflare DNS records"
  value       = module.alb.alb_dns_name
}

output "database_url_secret_arn" {
  description = "ARN of the database URL secret"
  value       = module.rds.database_url_secret_arn
  sensitive   = true
}

output "deployment_info" {
  description = "Summary of deployment resources"
  value = {
    region      = local.config.aws.region
    cluster     = local.config.ecs.cluster
    alb         = module.alb.alb_dns_name
    s3_bucket   = module.s3.bucket_name
    ecr_repos   = module.ecr.repository_urls
  }
}
