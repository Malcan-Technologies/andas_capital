# Networking Module - VPC, Subnets, Security Groups
# Creates the network infrastructure for ECS services

variable "client_slug" {
  description = "Client identifier"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones for public subnets (ECS)"
  type        = list(string)
  default     = ["ap-southeast-5a"]  # Single AZ for cost savings
}

variable "region" {
  description = "AWS region (used for RDS multi-AZ subnet requirement)"
  type        = string
  default     = "ap-southeast-5"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name   = "${var.client_slug}-vpc"
    Client = var.client_slug
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name   = "${var.client_slug}-igw"
    Client = var.client_slug
  }
}

# Public Subnets (for ALB and ECS with public IPs)
resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name   = "${var.client_slug}-public-${count.index + 1}"
    Client = var.client_slug
    Type   = "public"
  }
}

# Private Subnets (for RDS - needs 2 AZs for subnet group requirement)
locals {
  # RDS requires subnets in at least 2 AZs for the subnet group
  rds_availability_zones = ["${var.region}a", "${var.region}b"]
}

resource "aws_subnet" "private" {
  count             = 2  # Always 2 for RDS subnet group requirement
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 100)
  availability_zone = local.rds_availability_zones[count.index]

  tags = {
    Name   = "${var.client_slug}-private-${count.index + 1}"
    Client = var.client_slug
    Type   = "private"
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name   = "${var.client_slug}-public-rt"
    Client = var.client_slug
  }
}

# Associate Public Subnets with Route Table
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security Group for ALB
resource "aws_security_group" "alb" {
  name        = "${var.client_slug}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name   = "${var.client_slug}-alb-sg"
    Client = var.client_slug
  }
}

# Security Group for ECS Tasks
resource "aws_security_group" "ecs" {
  name        = "${var.client_slug}-ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "HTTP from ALB"
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name   = "${var.client_slug}-ecs-sg"
    Client = var.client_slug
  }
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "${var.client_slug}-rds-sg"
  description = "Security group for RDS"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from ECS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name   = "${var.client_slug}-rds-sg"
    Client = var.client_slug
  }
}

# Outputs
output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs.id
}

output "rds_security_group_id" {
  value = aws_security_group.rds.id
}
