
/**
 * Form validation utility functions
 */

/**
 * Email validation using regex pattern
 */
export const isValidEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

/**
 * Password strength validation
 * Returns an object with result and message
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  
  // Check for password strength if needed
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumbers = /\d/.test(password);
  // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return { isValid: true, message: 'Password is valid' };
};

/**
 * Validate that two passwords match
 */
export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Name validation
 */
export const isValidName = (name: string): boolean => {
  return name.trim().length > 0;
};

/**
 * Generic form field validator
 * Used for required fields
 */
export const isFieldEmpty = (value: string): boolean => {
  return value.trim().length === 0;
};

/**
 * Comprehensive login form validation
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
