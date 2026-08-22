/**
 * Comprehensive Validation & Sanitization Utility for Form Fields
 */

// Helper to create consistent validation result
const validationResult = (isValid, error = null) => ({
  isValid,
  error,
  toString: () => error || ''
});

// --- SANITIZERS (For live typing / onChange) ---

/**
 * Strips all non-digit characters and truncates to maxLength if provided.
 * @param {string|number} value 
 * @param {number} [maxLength] 
 * @returns {string}
 */
export const sanitizeDigits = (value, maxLength = null) => {
  if (value === undefined || value === null) return '';
  const digits = String(value).replace(/\D/g, '');
  return maxLength ? digits.slice(0, maxLength) : digits;
};

/**
 * Strips non-decimal characters, allowing only valid positive float format.
 * @param {string|number} value 
 * @returns {string}
 */
export const sanitizeDecimal = (value) => {
  if (value === undefined || value === null) return '';
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
};

/**
 * Strips non-alphanumeric characters, converts to uppercase, and limits to 10 chars.
 * @param {string} value 
 * @returns {string}
 */
export const sanitizePAN = (value) => {
  if (!value) return '';
  return String(value).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
};

/**
 * Strips non-alphanumeric characters, converts to uppercase, and limits to 15 chars.
 * @param {string} value 
 * @returns {string}
 */
export const sanitizeGSTIN = (value) => {
  if (!value) return '';
  return String(value).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
};

/**
 * Strips non-alphanumeric characters, converts to uppercase, and limits to 11 chars.
 * @param {string} value 
 * @returns {string}
 */
export const sanitizeIFSC = (value) => {
  if (!value) return '';
  return String(value).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 11);
};

/**
 * Prevents invalid keys like 'e', 'E', '+', '-' on number inputs.
 * @param {React.KeyboardEvent} e 
 * @param {Object} [options]
 * @param {boolean} [options.allowDecimal=false]
 * @param {boolean} [options.allowNegative=false]
 */
export const preventInvalidNumberKeys = (e, { allowDecimal = false, allowNegative = false } = {}) => {
  const invalidKeys = ['e', 'E'];
  if (!allowNegative) invalidKeys.push('-');
  invalidKeys.push('+');
  if (!allowDecimal) invalidKeys.push('.');
  
  if (invalidKeys.includes(e.key)) {
    e.preventDefault();
  }
};

// --- VALIDATORS (For submit / field blur / validation alerts) ---

/**
 * Validates password with configurable rules.
 * @param {string} password 
 * @param {Object} [options]
 * @param {number} [options.minLength=6]
 * @param {boolean} [options.required=true]
 * @param {string} [options.fieldName='Password']
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validatePassword = (password, { minLength = 6, required = true, fieldName = 'Password' } = {}) => {
  if (!password || !String(password).trim()) {
    if (required) {
      return validationResult(false, `${fieldName} is required.`);
    }
    return validationResult(true, null);
  }

  if (String(password).length < minLength) {
    return validationResult(false, `${fieldName} must be at least ${minLength} characters.`);
  }

  return validationResult(true, null);
};

/**
 * Validates confirm password match.
 * @param {string} password 
 * @param {string} confirmPassword 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || !String(confirmPassword).trim()) {
    return validationResult(false, 'Please confirm your password.');
  }
  if (password !== confirmPassword) {
    return validationResult(false, 'Passwords do not match.');
  }
  return validationResult(true, null);
};

/**
 * Validates phone numbers (10 digits Indian mobile format: starting with 6, 7, 8, or 9).
 * @param {string} phone 
 * @param {Object} [options]
 * @param {boolean} [options.required=true]
 * @param {string} [options.fieldName='Phone number']
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validatePhone = (phone, { required = true, fieldName = 'Phone number' } = {}) => {
  if (!phone || !String(phone).trim()) {
    if (required) {
      return validationResult(false, `${fieldName} is required.`);
    }
    return validationResult(true, null);
  }

  const digits = String(phone).replace(/\D/g, '');
  if (digits.length !== 10) {
    return validationResult(false, `${fieldName} must be exactly 10 digits.`);
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return validationResult(false, `${fieldName} must start with 6, 7, 8, or 9.`);
  }

  return validationResult(true, null);
};

/**
 * Validates Date of Birth (must be valid past date, not in future, minimum age 18, maximum age 100).
 * @param {string} dob 
 * @param {Object} [options]
 * @param {boolean} [options.required=false]
 * @param {number} [options.minAge=18]
 * @param {number} [options.maxAge=100]
 * @param {string} [options.fieldName='Date of Birth']
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateDOB = (dob, { required = false, minAge = 18, maxAge = 100, fieldName = 'Date of Birth' } = {}) => {
  if (!dob || !String(dob).trim()) {
    if (required) {
      return validationResult(false, `${fieldName} is required.`);
    }
    return validationResult(true, null);
  }

  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) {
    return validationResult(false, `Please enter a valid ${fieldName}.`);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (birthDate >= today) {
    return validationResult(false, `${fieldName} cannot be in the future.`);
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < minAge) {
    return validationResult(false, `Employee must be at least ${minAge} years old.`);
  }

  if (age > maxAge) {
    return validationResult(false, `Please enter a valid ${fieldName} (Age cannot exceed ${maxAge} years).`);
  }

  return validationResult(true, null);
};

/**
 * Validates standard 6-digit postal pincode.
 * @param {string} pincode 
 * @param {Object} [options]
 * @param {boolean} [options.required=true]
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validatePincode = (pincode, { required = true } = {}) => {
  if (!pincode || !String(pincode).trim()) {
    if (required) {
      return validationResult(false, 'Pincode is required.');
    }
    return validationResult(true, null);
  }

  const digits = String(pincode).replace(/\D/g, '');
  if (digits.length !== 6) {
    return validationResult(false, 'Pincode must be exactly 6 digits.');
  }

  return validationResult(true, null);
};

/**
 * Validates 12-digit Aadhaar number.
 * @param {string} aadhaar 
 * @param {Object} [options]
 * @param {boolean} [options.required=true]
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateAadhaar = (aadhaar, { required = true } = {}) => {
  if (!aadhaar || !String(aadhaar).trim()) {
    if (required) {
      return validationResult(false, 'Aadhaar number is required.');
    }
    return validationResult(true, null);
  }

  const digits = String(aadhaar).replace(/\D/g, '');
  if (digits.length !== 12) {
    return validationResult(false, 'Aadhaar number must be exactly 12 digits.');
  }

  return validationResult(true, null);
};

/**
 * Validates PAN number (10 characters: 5 letters, 4 digits, 1 letter).
 * @param {string} pan 
 * @param {Object} [options]
 * @param {boolean} [options.required=true]
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validatePAN = (pan, { required = true } = {}) => {
  if (!pan || !String(pan).trim()) {
    if (required) {
      return validationResult(false, 'PAN number is required.');
    }
    return validationResult(true, null);
  }

  const cleanPan = String(pan).trim().toUpperCase();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
    return validationResult(false, 'Invalid PAN format. Example: ABCDE1234F');
  }

  return validationResult(true, null);
};

/**
 * Validates GSTIN number (15 characters: 2 digits, 5 letters, 4 digits, 1 letter, 1 digit/letter, Z, 1 digit/letter).
 * @param {string} gstin 
 * @param {Object} [options]
 * @param {boolean} [options.required=true]
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateGSTIN = (gstin, { required = true } = {}) => {
  if (!gstin || !String(gstin).trim()) {
    if (required) {
      return validationResult(false, 'GSTIN is required.');
    }
    return validationResult(true, null);
  }

  const cleanGstin = String(gstin).trim().toUpperCase();
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGstin)) {
    return validationResult(false, 'Invalid GSTIN format (15 characters, e.g., 22AAAAA0000A1Z5).');
  }

  return validationResult(true, null);
};

/**
 * Validates bank account number (9 to 18 digits).
 * @param {string} accountNumber 
 * @param {Object} [options]
 * @param {boolean} [options.required=true]
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateAccountNumber = (accountNumber, { required = true } = {}) => {
  if (!accountNumber || !String(accountNumber).trim()) {
    if (required) {
      return validationResult(false, 'Account number is required.');
    }
    return validationResult(true, null);
  }

  const digits = String(accountNumber).replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 18) {
    return validationResult(false, 'Account number must be between 9 and 18 digits.');
  }

  return validationResult(true, null);
};

/**
 * Validates bank IFSC code (11 characters: 4 letters, 0, 6 alphanumeric).
 * @param {string} ifsc 
 * @param {Object} [options]
 * @param {boolean} [options.required=true]
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateIFSC = (ifsc, { required = true } = {}) => {
  if (!ifsc || !String(ifsc).trim()) {
    if (required) {
      return validationResult(false, 'IFSC code is required.');
    }
    return validationResult(true, null);
  }

  const cleanIfsc = String(ifsc).trim().toUpperCase();
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
    return validationResult(false, 'Invalid IFSC code format (e.g., SBIN0001234).');
  }

  return validationResult(true, null);
};

/**
 * Validates positive number / amount / quantity / salary fields.
 * @param {string|number} value 
 * @param {string} [fieldName='Value']
 * @param {Object} [options]
 * @param {number} [options.min=0]
 * @param {number} [options.max=Infinity]
 * @param {boolean} [options.required=true]
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validatePositiveNumber = (value, fieldName = 'Value', { min = 0, max = Infinity, required = true } = {}) => {
  if (value === '' || value === null || value === undefined) {
    if (required) {
      return validationResult(false, `${fieldName} is required.`);
    }
    return validationResult(true, null);
  }

  const num = Number(value);
  if (isNaN(num)) {
    return validationResult(false, `${fieldName} must be a valid number.`);
  }

  if (num < min) {
    return validationResult(false, `${fieldName} cannot be less than ${min}.`);
  }

  if (num > max) {
    return validationResult(false, `${fieldName} cannot exceed ${max}.`);
  }

  return validationResult(true, null);
};

/**
 * Validates email format.
 * @param {string} email 
 * @param {Object} [options]
 * @param {boolean} [options.required=true]
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateEmail = (email, { required = true } = {}) => {
  if (!email || !String(email).trim()) {
    if (required) {
      return validationResult(false, 'Email is required.');
    }
    return validationResult(true, null);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email).trim())) {
    return validationResult(false, 'Please enter a valid email address.');
  }

  return validationResult(true, null);
};

