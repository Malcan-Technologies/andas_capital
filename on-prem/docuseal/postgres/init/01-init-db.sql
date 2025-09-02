-- Initialize DocuSeal database
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create additional extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone to Malaysia
SET timezone = 'Asia/Kuala_Lumpur';

-- Grant necessary permissions to docuseal user
GRANT ALL PRIVILEGES ON DATABASE docuseal TO docuseal;

-- Create schema for better organization (optional)
-- CREATE SCHEMA IF NOT EXISTS docuseal_app;
-- GRANT ALL ON SCHEMA docuseal_app TO docuseal;

-- Database initialization completed
SELECT 'DocuSeal database initialized successfully' as status;
