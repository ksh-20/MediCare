export const validators = {
  // Email validation
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) || 'Please enter a valid email address'
  },

  // Password validation
  password: (value) => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Password must be at least 8 characters long'
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter'
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter'
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number'
    return true
  },

  // Phone number validation
  phone: (value) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(value.replace(/\s/g, '')) || 'Please enter a valid phone number'
  },

  // Required field validation
  required: (value) => {
    return (value && value.toString().trim().length > 0) || 'This field is required'
  },

  // Name validation
  name: (value) => {
    if (!value) return 'Name is required'
    if (value.length < 2) return 'Name must be at least 2 characters long'
    if (value.length > 50) return 'Name must be less than 50 characters'
    if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Name can only contain letters, spaces, hyphens, and apostrophes'
    return true
  },

  // Age validation
  age: (value) => {
    const age = parseInt(value)
    if (isNaN(age)) return 'Please enter a valid age'
    if (age < 0) return 'Age cannot be negative'
    if (age > 150) return 'Please enter a realistic age'
    return true
  },

  // Date validation
  date: (value) => {
    if (!value) return 'Date is required'
    const date = new Date(value)
    if (isNaN(date.getTime())) return 'Please enter a valid date'
    return true
  },

  // Future date validation
  futureDate: (value) => {
    if (!value) return 'Date is required'
    const date = new Date(value)
    if (isNaN(date.getTime())) return 'Please enter a valid date'
    if (date <= new Date()) return 'Date must be in the future'
    return true
  },

  // Past date validation
  pastDate: (value) => {
    if (!value) return 'Date is required'
    const date = new Date(value)
    if (isNaN(date.getTime())) return 'Please enter a valid date'
    if (date >= new Date()) return 'Date must be in the past'
    return true
  },

  // Time validation
  time: (value) => {
    if (!value) return 'Time is required'
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(value) || 'Please enter a valid time (HH:MM)'
  },

  // Medication name validation
  medicationName: (value) => {
    if (!value) return 'Medication name is required'
    if (value.length < 2) return 'Medication name must be at least 2 characters long'
    if (value.length > 100) return 'Medication name must be less than 100 characters'
    return true
  },

  // Dosage validation
  dosage: (value) => {
    if (!value) return 'Dosage is required'
    if (!/^\d+(\.\d+)?\s*[a-zA-Z]*$/.test(value)) return 'Please enter a valid dosage (e.g., 5mg, 10ml)'
    return true
  },

  // Frequency validation
  frequency: (value) => {
    if (!value) return 'Frequency is required'
    const validFrequencies = ['once', 'twice', 'three times', 'four times', 'as needed']
    return validFrequencies.includes(value.toLowerCase()) || 'Please select a valid frequency'
  },

  // Duration validation
  duration: (value) => {
    if (!value) return 'Duration is required'
    const duration = parseInt(value)
    if (isNaN(duration)) return 'Please enter a valid duration'
    if (duration < 1) return 'Duration must be at least 1 day'
    if (duration > 365) return 'Duration must be less than 365 days'
    return true
  },

  // Notes validation
  notes: (value) => {
    if (value && value.length > 500) return 'Notes must be less than 500 characters'
    return true
  },

  // Emergency contact validation
  emergencyContact: (value) => {
    if (!value) return 'Emergency contact is required'
    if (value.length < 2) return 'Emergency contact name must be at least 2 characters long'
    return true
  },

  // Emergency phone validation
  emergencyPhone: (value) => {
    if (!value) return 'Emergency phone is required'
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(value.replace(/\s/g, '')) || 'Please enter a valid emergency phone number'
  },

  // File validation
  file: (file, options = {}) => {
    if (!file) return 'File is required'
    
    const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options // 5MB default
    
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
    }
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`
    }
    
    return true
  },

  // Image file validation
  imageFile: (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    return validators.file(file, { 
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes 
    })
  },

  // Audio file validation
  audioFile: (file) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3']
    return validators.file(file, { 
      maxSize: 50 * 1024 * 1024, // 50MB
      allowedTypes 
    })
  },

  // URL validation
  url: (value) => {
    if (!value) return 'URL is required'
    try {
      new URL(value)
      return true
    } catch {
      return 'Please enter a valid URL'
    }
  },

  // Number validation
  number: (value, options = {}) => {
    const { min, max, integer = false } = options
    
    if (value === '' || value === null || value === undefined) {
      return options.required ? 'This field is required' : true
    }
    
    const num = integer ? parseInt(value) : parseFloat(value)
    
    if (isNaN(num)) return 'Please enter a valid number'
    
    if (min !== undefined && num < min) {
      return `Value must be at least ${min}`
    }
    
    if (max !== undefined && num > max) {
      return `Value must be at most ${max}`
    }
    
    return true
  },

  // Positive number validation
  positiveNumber: (value) => {
    return validators.number(value, { min: 0 })
  },

  // Integer validation
  integer: (value, options = {}) => {
    return validators.number(value, { ...options, integer: true })
  },

  // Array validation
  array: (value, options = {}) => {
    const { minLength, maxLength, required = true } = options
    
    if (required && (!Array.isArray(value) || value.length === 0)) {
      return 'At least one item is required'
    }
    
    if (Array.isArray(value)) {
      if (minLength !== undefined && value.length < minLength) {
        return `At least ${minLength} items are required`
      }
      
      if (maxLength !== undefined && value.length > maxLength) {
        return `No more than ${maxLength} items are allowed`
      }
    }
    
    return true
  },

  // Custom validation function
  custom: (value, validatorFn, errorMessage) => {
    try {
      const result = validatorFn(value)
      return result === true ? true : (result || errorMessage)
    } catch (error) {
      return errorMessage || 'Validation error'
    }
  }
}
