# ALB Module - Application Load Balancer

variable "client_slug" {
  description = "Client identifier"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for ALB"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for ALB"
  type        = string
}

variable "domains" {
  description = "Domain configuration"
  type = object({
    app   = string
    admin = string
    api   = string
    sign  = string
  })
}

variable "target_groups" {
  description = "Target group ARNs for routing"
  type = map(object({
    arn = string
  }))
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
  default     = ""
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.client_slug}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false

  tags = {
    Name   = "${var.client_slug}-alb"
    Client = var.client_slug
  }
}

# HTTP Listener (redirects to HTTPS)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTPS Listener (when certificate is provided)
resource "aws_lb_listener" "https" {
  count = var.certificate_arn != "" ? 1 : 0

  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}

# Listener Rules for HTTPS
resource "aws_lb_listener_rule" "api" {
  count = var.certificate_arn != "" ? 1 : 0

  listener_arn = aws_lb_listener.https[0].arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = var.target_groups["backend"].arn
  }

  condition {
    host_header {
      values = [var.domains.api]
    }
  }
}

resource "aws_lb_listener_rule" "app" {
  count = var.certificate_arn != "" ? 1 : 0

  listener_arn = aws_lb_listener.https[0].arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = var.target_groups["frontend"].arn
  }

  condition {
    host_header {
      values = [var.domains.app]
    }
  }
}

resource "aws_lb_listener_rule" "admin" {
  count = var.certificate_arn != "" ? 1 : 0

  listener_arn = aws_lb_listener.https[0].arn
  priority     = 300

  action {
    type             = "forward"
    target_group_arn = var.target_groups["admin"].arn
  }

  condition {
    host_header {
      values = [var.domains.admin]
    }
  }
}

# Outputs
output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "alb_zone_id" {
  value = aws_lb.main.zone_id
}

output "alb_arn" {
  value = aws_lb.main.arn
}

output "http_listener_arn" {
  value = aws_lb_listener.http.arn
}

output "https_listener_arn" {
  value = var.certificate_arn != "" ? aws_lb_listener.https[0].arn : ""
}
