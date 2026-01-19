# RDS Module - PostgreSQL Database

variable "client_slug" {
  description = "Client identifier"
  type        = string
}

variable "identifier" {
  description = "RDS instance identifier"
  type        = string
}

variable "database_name" {
  description = "Database name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for RDS"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for RDS"
  type        = string
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "16.1"
}

# Generate random password for RDS
resource "random_password" "rds" {
  length  = 32
  special = false
}

# Store password in Secrets Manager
resource "aws_secretsmanager_secret" "rds_password" {
  name = "${var.client_slug}/prod/rds-password"

  tags = {
    Client = var.client_slug
  }
}

resource "aws_secretsmanager_secret_version" "rds_password" {
  secret_id     = aws_secretsmanager_secret.rds_password.id
  secret_string = random_password.rds.result
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.client_slug}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name   = "${var.client_slug}-db-subnet-group"
    Client = var.client_slug
  }
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier = var.identifier

  engine         = "postgres"
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.database_name
  username = "postgres"
  password = random_password.rds.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.security_group_id]

  multi_az               = false
  publicly_accessible    = false
  skip_final_snapshot    = true
  deletion_protection    = false

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  performance_insights_enabled = false

  tags = {
    Name   = var.identifier
    Client = var.client_slug
  }
}

# Store database URL in Secrets Manager
resource "aws_secretsmanager_secret" "database_url" {
  name = "${var.client_slug}/prod/database-url"

  tags = {
    Client = var.client_slug
  }
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = "postgresql://postgres:${random_password.rds.result}@${aws_db_instance.main.endpoint}/${var.database_name}"
}

# Outputs
output "endpoint" {
  value = aws_db_instance.main.endpoint
}

output "database_url_secret_arn" {
  value = aws_secretsmanager_secret.database_url.arn
}

output "rds_password_secret_arn" {
  value = aws_secretsmanager_secret.rds_password.arn
}
