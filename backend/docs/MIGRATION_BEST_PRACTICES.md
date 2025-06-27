# Migration Best Practices

This document outlines best practices for handling database migrations in our application.

## Quick Commands

### Development
```bash
# Safe migration for development
./scripts/safe-deploy-migrations.sh dev

# Create a new migration
npx prisma migrate dev --name descriptive_migration_name
```

### Production
```bash
# Safe migration for production
./scripts/safe-deploy-migrations.sh prod

# Manual production migration (if automated fails)
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## Migration Workflow

### 1. Development Phase
1. Make schema changes in `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Test the migration locally
4. Commit both schema and migration files

### 2. Production Deployment
1. Use the safe deployment script: `./scripts/safe-deploy-migrations.sh prod`
2. Monitor logs for any issues
3. Verify application functionality

## Common Issues and Solutions

### P3009 - Failed Migrations
**Cause**: Migration marked as failed in database
**Solution**: Use `npx prisma migrate resolve --applied <migration_name>`

### P3018 - Data Conflicts
**Cause**: Trying to add NOT NULL column to table with existing data
**Solution**: 
1. Add column as nullable first
2. Populate data
3. Make column NOT NULL in separate migration

### Missing Indexes
**Cause**: Index creation failed but wasn't rolled back properly
**Solution**: Manually create indexes then resolve migration

## Migration Safety Rules

### 1. Always Backup Production
- Automatic backups are created by the safe deployment script
- Keep backups for at least 7 days

### 2. Test Migrations Locally First
```bash
# Reset local database and test migration
npx prisma migrate reset
npx prisma migrate deploy
```

### 3. Use Descriptive Migration Names
- ✅ Good: `add_user_preferences_table`
- ✅ Good: `fix_loan_amount_constraints`
- ❌ Bad: `migration1`, `fix_stuff`

### 4. Avoid Destructive Changes
- Never drop columns in production without data migration
- Use separate migrations for:
  1. Add new column (nullable)
  2. Migrate data
  3. Make column required
  4. Remove old column (in future release)

### 5. Handle Large Tables Carefully
For tables with >100k records:
- Use `ADD COLUMN IF NOT EXISTS` for safety
- Consider background data migration scripts
- Monitor migration performance

## Emergency Procedures

### If Migration Fails in Production
1. **Don't panic** - the safe deployment script handles most issues
2. Check logs for specific error codes (P3009, P3018, etc.)
3. Use appropriate resolution:
   ```bash
   # For failed migrations
   npx prisma migrate resolve --applied <migration_name>
   
   # For rolled back migrations
   npx prisma migrate resolve --rolled-back <migration_name>
   ```

### If Application Won't Start
1. Check if Prisma client is generated:
   ```bash
   docker compose -f docker-compose.prod.yml exec backend npx prisma generate
   ```
2. Verify database connection:
   ```bash
   docker compose -f docker-compose.prod.yml exec backend node -e "
   const { PrismaClient } = require('@prisma/client');
   const prisma = new PrismaClient();
   prisma.\$queryRaw\`SELECT 1\`.then(() => console.log('✅ DB OK')).catch(console.error);
   "
   ```

## Development vs Production Differences

### Development (`migrate dev`)
- Creates migration files
- Applies migrations immediately
- Resets database if needed
- Generates Prisma client

### Production (`migrate deploy`)
- Only applies existing migrations
- Never resets database
- Fails fast on conflicts
- Requires manual conflict resolution

## Monitoring and Alerting

### Key Metrics to Monitor
- Migration execution time
- Database connection pool status
- Application startup time after migrations

### Alert Conditions
- Migration takes >5 minutes
- Multiple migration failures
- Database connection errors after migration

## Tools and Scripts

### Available Scripts
- `safe-deploy-migrations.sh` - Main deployment script
- `fix-totalAmount-migration.js` - Specific data fix
- `deployment-migration-fix.sh` - Legacy fix script

### Useful Commands
```bash
# Check migration status
npx prisma migrate status

# Generate Prisma client
npx prisma generate

# Reset development database
npx prisma migrate reset

# View database schema
npx prisma db pull
```

## Version Control

### What to Commit
- ✅ `prisma/schema.prisma`
- ✅ `prisma/migrations/` directory
- ✅ Migration scripts in `scripts/`

### What NOT to Commit
- ❌ `node_modules/.prisma/`
- ❌ Generated client files
- ❌ Database backup files

## Testing Migrations

### Local Testing
```bash
# Test migration on fresh database
npx prisma migrate reset --force
npx prisma migrate deploy
npm run test
```

### Staging Testing
```bash
# Deploy to staging first
./scripts/safe-deploy-migrations.sh prod
# Run integration tests
# Verify application functionality
```

## Rollback Procedures

### Safe Rollback Steps
1. Stop application
2. Restore database from backup
3. Deploy previous application version
4. Restart application
5. Verify functionality

### Migration Rollback
```bash
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back <migration_name>

# Apply previous state
git checkout <previous_commit>
npx prisma migrate deploy
``` 