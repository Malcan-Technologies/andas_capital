-- Postgres user is already created by the container
ALTER USER postgres WITH SUPERUSER;
CREATE DATABASE kapital;
GRANT ALL PRIVILEGES ON DATABASE kapital TO postgres;

-- Grant all privileges to the user
ALTER USER postgres CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE kapital TO postgres;
\c kapital;
GRANT ALL ON SCHEMA public TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;

-- Create the prisma user
CREATE USER prisma WITH PASSWORD 'prisma';

-- Grant all privileges to prisma user
GRANT ALL PRIVILEGES ON SCHEMA public TO prisma;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO prisma;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO prisma;

-- Make prisma the owner of the public schema
ALTER SCHEMA public OWNER TO prisma;

-- Create the kapital user
CREATE USER kapital WITH PASSWORD 'kapital123';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO kapital;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO kapital; 