/**
 * Utility functions for IC number validation and date of birth extraction
 * Supports both Malaysian IC numbers and passport numbers
 */

export interface ICValidationResult {
  isValid: boolean;
  type: 'IC' | 'PASSPORT' | null;
  error?: string;
  extractedDOB?: Date;
}

export interface ICInfo {
  number: string;
  type: 'IC' | 'PASSPORT';
  dateOfBirth?: Date;
}

/**
 * Converts a 2-digit year to a 4-digit year using dynamic threshold
 * Uses current year to determine century: if the resulting year would be in the future, use previous century
 * @param twoDigitYear - The 2-digit year (0-99)
 * @returns The full 4-digit year
 */
function convertToFullYear(twoDigitYear: number): number {
  const currentYear = new Date().getFullYear();
  const currentCentury = Math.floor(currentYear / 100) * 100; // e.g., 2000 for years 2000-2099
  
  // Try current century first
  let fullYear = currentCentury + twoDigitYear;
  
  // If the resulting year is more than 1 year in the future, it's probably from the previous century
  // (We allow 1 year buffer for people born late in the year who haven't had their birthday yet)
  if (fullYear > currentYear + 1) {
    fullYear = currentCentury - 100 + twoDigitYear; // Previous century
  }
  
  return fullYear;
}

/**
 * Validates Malaysian IC number format (YYMMDD-PB-XXXX)
 * @param icNumber - The IC number to validate
 * @returns boolean indicating if it's a valid Malaysian IC format
 */
export function isValidMalaysianIC(icNumber: string): boolean {
  // Remove all non-digit characters
  const cleanIC = icNumber.replace(/\D/g, '');
  
  // Malaysian IC should be exactly 12 digits
  if (cleanIC.length !== 12) {
    return false;
  }

  // Check if the first 6 digits form a valid date
  const yearStr = cleanIC.substring(0, 2);
  const monthStr = cleanIC.substring(2, 4);
  const dayStr = cleanIC.substring(4, 6);
  
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  
  // Basic date validation
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Check if it's a valid date using dynamic year conversion
  const fullYear = convertToFullYear(year);
  const date = new Date(fullYear, month - 1, day, 12, 0, 0, 0);
  
  return date.getFullYear() === fullYear && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
}

/**
 * Extracts date of birth from Malaysian IC number
 * @param icNumber - The Malaysian IC number
 * @returns Date object or null if extraction fails
 */
export function extractDOBFromMalaysianIC(icNumber: string): Date | null {
  if (!isValidMalaysianIC(icNumber)) {
    return null;
  }

  const cleanIC = icNumber.replace(/\D/g, '');
  
  const yearStr = cleanIC.substring(0, 2);
  const monthStr = cleanIC.substring(2, 4);
  const dayStr = cleanIC.substring(4, 6);
  
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  
  // Use dynamic year conversion based on current year
  const fullYear = convertToFullYear(year);
  
  // Create date at noon to avoid timezone issues with date-only values
  const date = new Date(fullYear, month - 1, day, 12, 0, 0, 0);
  return date;
}

/**
 * Validates passport number format (basic validation)
 * @param passportNumber - The passport number to validate
 * @returns boolean indicating if it's a valid passport format
 */
export function isValidPassportNumber(passportNumber: string): boolean {
  // Remove spaces and convert to uppercase
  const cleanPassport = passportNumber.replace(/\s/g, '').toUpperCase();
  
  // Basic passport validation - should be 6-12 alphanumeric characters
  const passportRegex = /^[A-Z0-9]{6,12}$/;
  return passportRegex.test(cleanPassport);
}

/**
 * Comprehensive IC/Passport validation
 * @param identifier - The IC number or passport number
 * @param type - Optional type hint ('IC' or 'PASSPORT')
 * @returns ICValidationResult with validation details
 */
export function validateICOrPassport(identifier: string, type?: 'IC' | 'PASSPORT'): ICValidationResult {
  if (!identifier || identifier.trim().length === 0) {
    return {
      isValid: false,
      type: null,
      error: 'IC/Passport number is required'
    };
  }

  const cleanIdentifier = identifier.trim();

  // If type is specified, validate according to that type
  if (type === 'IC') {
    if (isValidMalaysianIC(cleanIdentifier)) {
      const extractedDOB = extractDOBFromMalaysianIC(cleanIdentifier);
      return {
        isValid: true,
        type: 'IC',
        extractedDOB: extractedDOB || undefined
      };
    } else {
      return {
        isValid: false,
        type: 'IC',
        error: 'Invalid Malaysian IC number format. Expected format: YYMMDD-PB-XXXX'
      };
    }
  }

  if (type === 'PASSPORT') {
    if (isValidPassportNumber(cleanIdentifier)) {
      return {
        isValid: true,
        type: 'PASSPORT'
      };
    } else {
      return {
        isValid: false,
        type: 'PASSPORT',
        error: 'Invalid passport number format. Should be 6-12 alphanumeric characters'
      };
    }
  }

  // Auto-detect type if not specified
  if (isValidMalaysianIC(cleanIdentifier)) {
    const extractedDOB = extractDOBFromMalaysianIC(cleanIdentifier);
    return {
      isValid: true,
      type: 'IC',
      extractedDOB: extractedDOB || undefined
    };
  } else if (isValidPassportNumber(cleanIdentifier)) {
    return {
      isValid: true,
      type: 'PASSPORT'
    };
  } else {
    return {
      isValid: false,
      type: null,
      error: 'Invalid IC/Passport number format'
    };
  }
}

/**
 * Formats Malaysian IC number with dashes
 * @param icNumber - The IC number to format
 * @returns Formatted IC number or original if not valid
 */
export function formatMalaysianIC(icNumber: string): string {
  if (!isValidMalaysianIC(icNumber)) {
    return icNumber;
  }

  const cleanIC = icNumber.replace(/\D/g, '');
  return `${cleanIC.substring(0, 6)}-${cleanIC.substring(6, 8)}-${cleanIC.substring(8, 12)}`;
}

/**
 * Gets the relationship options for emergency contact
 * @returns Array of relationship options
 */
export function getRelationshipOptions(): string[] {
  return [
    'Spouse',
    'Parent',
    'Child',
    'Sibling',
    'Relative',
    'Friend',
    'Colleague',
    'Other'
  ];
}

/**
 * Calculates age from date of birth
 * @param dateOfBirth - The date of birth
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Validates if a person is at least 18 years old
 * @param dateOfBirth - The date of birth to validate
 * @returns boolean indicating if the person is 18 or older
 */
export function isAtLeast18YearsOld(dateOfBirth: Date | null): boolean {
  if (!dateOfBirth) {
    return false;
  }
  
  return calculateAge(dateOfBirth) >= 18;
}

/**
 * Validates emergency contact phone number
 * @param phoneNumber - The phone number to validate
 * @returns boolean indicating if it's valid
 */
export function validateEmergencyContactPhone(phoneNumber: string): boolean {
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    return false;
  }

  // Remove all non-digit characters
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Should be at least 8 digits and at most 15 digits
  return cleanPhone.length >= 8 && cleanPhone.length <= 15;
} 