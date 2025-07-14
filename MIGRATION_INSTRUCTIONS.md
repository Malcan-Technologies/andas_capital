# Migration Instructions for IC Number and Emergency Contact Fields

## Prerequisites
- Docker must be running
- Backend services should be stopped

## Steps to Run Migration

1. **Start Docker services:**
   ```bash
   cd backend
   docker compose -f docker-compose.dev.yml up -d
   ```

2. **Run the migration:**
   ```bash
   docker compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy
   ```

3. **Regenerate Prisma client:**
   ```bash
   docker compose -f docker-compose.dev.yml exec backend npx prisma generate
   ```

4. **Restart backend services:**
   ```bash
   docker compose -f docker-compose.dev.yml restart backend
   ```

## What this migration adds:

- `icNumber` - IC/Passport number field
- `icType` - Type indicator ('IC' for Malaysian IC, 'PASSPORT' for passport)
- `emergencyContactName` - Emergency contact's full name
- `emergencyContactPhone` - Emergency contact's phone number
- `emergencyContactRelationship` - Relationship to user (spouse, parent, etc.)

## Verification

After running the migration, you can verify it worked by:
1. Checking the database schema
2. Testing the updated API endpoints
3. Confirming the frontend form works correctly

## Notes

- The migration is safe and adds nullable fields
- Existing data will not be affected
- The IC utility functions will automatically extract DOB from Malaysian IC numbers
- Passport numbers will not have DOB extraction capability 