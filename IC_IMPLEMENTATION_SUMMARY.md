# IC Number and Emergency Contact Implementation Summary

## Overview
This implementation adds IC number (or passport number) functionality with automatic date of birth extraction for Malaysian IC numbers, plus emergency contact details to the user profile system.

## Key Features

### 1. IC Number / Passport Number Support
- **Malaysian IC**: Automatically extracts date of birth from first 6 digits (YYMMDD format)
- **Passport Numbers**: Supports international passport numbers (no DOB extraction)
- **Auto-detection**: Automatically determines if input is IC or passport format
- **Validation**: Comprehensive validation for both IC and passport formats

### 2. Emergency Contact Information
- **Required Fields**: Name, phone number, relationship
- **Validation**: All fields must be provided together or none at all
- **Relationship Options**: Spouse, Parent, Child, Sibling, Relative, Friend, Colleague, Other

## Files Created/Modified

### Database Schema
- **File**: `backend/prisma/schema.prisma`
- **Changes**: Added `icNumber`, `icType`, `emergencyContactName`, `emergencyContactPhone`, `emergencyContactRelationship` fields to User model

### Migration
- **File**: `backend/prisma/migrations/20250714120950_add_ic_emergency_contact_fields/migration.sql`
- **Purpose**: Adds new nullable fields to users table

### IC Utility Functions
- **File**: `frontend/lib/icUtils.ts`
- **Functions**:
  - `validateICOrPassport()`: Validates IC/passport and auto-detects type
  - `extractDOBFromMalaysianIC()`: Extracts DOB from Malaysian IC
  - `formatMalaysianIC()`: Formats IC with dashes
  - `getRelationshipOptions()`: Returns relationship dropdown options
  - `validateEmergencyContactPhone()`: Validates emergency contact phone

### Backend API Updates
- **File**: `backend/src/api/users-updated.ts` (will replace users.ts after migration)
- **Changes**:
  - Added IC and emergency contact fields to GET /api/users/me response
  - Added validation for IC and emergency contact fields in PUT /api/users/me
  - Updated Swagger documentation

### Frontend Profile Page
- **File**: `frontend/app/dashboard/profile/page.tsx`
- **Changes**:
  - Added IC/Passport Information card with auto-detection and DOB extraction
  - Added Emergency Contact card with validation
  - Added error handling for both sections
  - Updated interface to include new fields

## How It Works

### IC Number Processing
1. User enters IC/passport number
2. `validateICOrPassport()` determines if it's Malaysian IC or passport
3. If Malaysian IC:
   - Validates format (12 digits, valid date)
   - Extracts DOB from first 6 digits
   - Automatically populates date of birth field
4. If passport:
   - Validates format (6-12 alphanumeric characters)
   - No DOB extraction

### Emergency Contact Processing
1. User fills in emergency contact fields
2. Validation ensures all three fields are provided together
3. Phone number validation ensures proper format
4. Relationship must be selected from predefined options

## Installation Steps

### 1. Run Database Migration
```bash
cd backend
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy
docker compose -f docker-compose.dev.yml exec backend npx prisma generate
docker compose -f docker-compose.dev.yml restart backend
```

### 2. Update Backend API
```bash
# After migration is complete:
mv backend/src/api/users.ts backend/src/api/users-backup.ts
mv backend/src/api/users-updated.ts backend/src/api/users.ts
```

### 3. Restart Services
```bash
docker compose -f docker-compose.dev.yml restart backend
```

## Testing Scenarios

### Malaysian IC Testing
- **Valid IC**: `891114075601` (should extract DOB: 1989-11-14)
- **Invalid IC**: `991301075601` (should fail - invalid month)
- **Valid IC**: `050228075601` (should extract DOB: 2005-02-28)

### Passport Testing
- **Valid Passport**: `A1234567`, `AB1234567`, `123456789`
- **Invalid Passport**: `12345` (too short), `ABCDEFGHIJKLM` (too long)

### Emergency Contact Testing
- **Valid**: All fields filled
- **Invalid**: Only some fields filled
- **Valid**: All fields empty (optional)

## Error Handling
- IC validation errors show specific format requirements
- Emergency contact errors indicate all fields are required
- Phone validation provides clear error messages
- Backend validation prevents invalid data storage

## UI/UX Features
- Real-time IC validation and DOB extraction
- Visual feedback for IC vs passport detection
- Clear error messages for all validation scenarios
- Consistent styling with existing profile cards
- Responsive design for mobile and desktop

## Security Considerations
- IC numbers are stored as provided (not hashed)
- Emergency contact information is stored in plain text
- All fields are optional to maintain backward compatibility
- Proper validation prevents malicious input

## Future Enhancements
- Support for other country IC formats
- Enhanced passport validation
- Emergency contact verification
- IC number masking in UI
- Audit trail for IC number changes 