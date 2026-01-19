# ECR Module - Container Registries

variable "client_slug" {
  description = "Client identifier"
  type        = string
}

variable "repos" {
  description = "List of repository names to create"
  type        = list(string)
  default     = ["backend", "frontend", "admin"]
}

# ECR Repositories
resource "aws_ecr_repository" "repos" {
  for_each = toset(var.repos)

  name                 = "${var.client_slug}/${each.key}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name   = "${var.client_slug}-${each.key}"
    Client = var.client_slug
  }
}

# Lifecycle policy to keep only last 10 images
resource "aws_ecr_lifecycle_policy" "repos" {
  for_each   = aws_ecr_repository.repos
  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Outputs
output "repository_urls" {
  value = {
    for k, v in aws_ecr_repository.repos : k => v.repository_url
  }
}

output "repository_arns" {
  value = {
    for k, v in aws_ecr_repository.repos : k => v.arn
  }
}
