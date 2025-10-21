const { body, param, query, validationResult } = require('express-validator')

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    })
  }
  next()
}

// Auth validation rules
const validateRegister = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
]

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
]

// Elderly validation rules
const validateElderly = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      if (new Date(value) >= new Date()) {
        throw new Error('Date of birth must be in the past')
      }
      return true
    }),
  
  body('emergencyContact.name')
    .trim()
    .notEmpty()
    .withMessage('Emergency contact name is required'),
  
  body('emergencyContact.phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid emergency contact phone number'),
  
  body('emergencyContact.relationship')
    .isIn(['spouse', 'child', 'parent', 'sibling', 'friend', 'caregiver', 'other'])
    .withMessage('Please provide a valid emergency contact relationship'),
  
  handleValidationErrors
]

// Medication validation rules
const validateMedication = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Medication name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Medication name must be between 2 and 100 characters'),
  
  body('dosage')
    .trim()
    .notEmpty()
    .withMessage('Dosage is required')
    .matches(/^\d+(\.\d+)?\s*[a-zA-Z]*$/)
    .withMessage('Please provide a valid dosage (e.g., 5mg, 10ml)'),
  
  body('unit')
    .isIn(['mg', 'g', 'ml', 'l', 'mcg', 'units', 'tablets', 'capsules', 'drops', 'puffs', 'patches'])
    .withMessage('Please provide a valid unit'),
  
  body('frequency')
    .isIn(['once', 'twice', 'three_times', 'four_times', 'as_needed', 'weekly', 'monthly'])
    .withMessage('Please provide a valid frequency'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date')
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date')
      }
      return true
    }),
  
  body('elderlyId')
    .isMongoId()
    .withMessage('Please provide a valid elderly patient ID'),
  
  handleValidationErrors
]

// Adherence log validation rules
const validateAdherenceLog = [
  body('medicationId')
    .isMongoId()
    .withMessage('Please provide a valid medication ID'),
  
  body('elderlyId')
    .isMongoId()
    .withMessage('Please provide a valid elderly patient ID'),
  
  body('status')
    .isIn(['taken', 'missed', 'skipped', 'delayed'])
    .withMessage('Please provide a valid status'),
  
  body('takenTime')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid taken time'),
  
  handleValidationErrors
]

// ID parameter validation
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
  
  handleValidationErrors
]

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
]

// Date range validation
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date')
    .custom((value, { req }) => {
      if (value && req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date')
      }
      return true
    }),
  
  handleValidationErrors
]

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateElderly,
  validateMedication,
  validateAdherenceLog,
  validateObjectId,
  validatePagination,
  validateDateRange
}
