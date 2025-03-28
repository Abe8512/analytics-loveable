
/**
 * Form Validation Utilities
 * 
 * A collection of utility functions for validating form inputs across the application.
 * Includes email, password, name validation and comprehensive form validators.
 * 
 * @module utils/formValidation
 */

/**
 * Validates email format using regex pattern
 * 
 * @param email - The email address to validate
 * @returns Boolean indicating if the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

/**
 * Validates password strength
 * Checks for length, uppercase, lowercase, and at least one number or special character
 * 
 * @param password - The password to validate
 * @returns Object with validation result and message
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  
  // Check for password strength if needed
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!(hasUpperCase && hasLowerCase && (hasNumbers || hasSpecialChar))) {
    return { 
      isValid: false, 
      message: 'Password must include uppercase, lowercase, and at least a number or special character' 
    };
  }
  
  return { isValid: true, message: 'Password is valid' };
};

/**
 * Checks if two passwords match
 * 
 * @param password - The original password
 * @param confirmPassword - The confirmation password
 * @returns Boolean indicating if passwords match
 */
export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Validates a name field is not empty
 * 
 * @param name - The name to validate
 * @returns Boolean indicating if the name is valid
 */
export const isValidName = (name: string): boolean => {
  return name.trim().length > 0;
};

/**
 * Generic validator for required fields
 * 
 * @param value - The field value to check
 * @returns Boolean indicating if the field is empty
 */
export const isFieldEmpty = (value: string): boolean => {
  return value.trim().length === 0;
};

/**
 * Comprehensive login form validation
 * Checks email format and required fields
 * 
 * @param email - The email address
 * @param password - The password
 * @returns Validation result object with isValid flag and error message
 */
export const validateLoginForm = (email: string, password: string): { isValid: boolean; message: string | null } => {
  if (isFieldEmpty(email)) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!isValidEmail(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  if (isFieldEmpty(password)) {
    return { isValid: false, message: 'Password is required' };
  }
  
  return { isValid: true, message: null };
};

/**
 * Comprehensive signup form validation
 * Checks name, email, password strength, and password match
 * 
 * @param name - The user's name
 * @param email - The email address
 * @param password - The password
 * @param confirmPassword - The confirmation password
 * @returns Validation result object with isValid flag and error message
 */
export const validateSignupForm = (
  name: string, 
  email: string, 
  password: string, 
  confirmPassword: string
): { isValid: boolean; message: string | null } => {
  if (isFieldEmpty(name)) {
    return { isValid: false, message: 'Name is required' };
  }
  
  if (isFieldEmpty(email)) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!isValidEmail(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return { isValid: false, message: passwordValidation.message };
  }
  
  if (!doPasswordsMatch(password, confirmPassword)) {
    return { isValid: false, message: 'Passwords do not match' };
  }
  
  return { isValid: true, message: null };
};

/**
 * Forgot password form validation
 * Checks email format
 * 
 * @param email - The email address
 * @returns Validation result object with isValid flag and error message
 */
export const validateForgotPasswordForm = (email: string): { isValid: boolean; message: string | null } => {
  if (isFieldEmpty(email)) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!isValidEmail(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true, message: null };
};
