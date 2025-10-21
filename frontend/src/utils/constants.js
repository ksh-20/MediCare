export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  ELDERLY: {
    BASE: '/elderly',
    MEDICATIONS: (id) => `/elderly/${id}/medications`,
    ADHERENCE: (id) => `/elderly/${id}/adherence`,
    REPORTS: (id) => `/elderly/${id}/reports`
  },
  MEDICATIONS: {
    BASE: '/medications',
    SCHEDULE: (id) => `/medications/schedule/${id}`,
    LOG_TAKEN: '/medications/log-taken',
    ADHERENCE: (id) => `/medications/${id}/adherence`,
    SEARCH: '/medications/search'
  },
  ADHERENCE: {
    BASE: '/adherence',
    LOG: '/adherence/log',
    ALERTS: '/adherence/alerts',
    REPORTS: '/adherence/reports'
  },
  REPORTS: {
    BASE: '/reports',
    ADHERENCE: '/reports/adherence',
    MEDICATION: '/reports/medication',
    FALL: '/reports/fall',
    COMPREHENSIVE: '/reports/comprehensive',
    DOWNLOAD: (id) => `/reports/${id}/download`,
    HISTORY: (id) => `/reports/history/${id}`,
    SCHEDULE: '/reports/schedule'
  },
  FALL: {
    BASE: '/fall',
    MONITORING: '/fall/monitoring',
    HISTORY: (id) => `/fall/history/${id}`,
    INCIDENT: (id) => `/fall/incident/${id}`,
    KEYWORDS: '/fall/keywords'
  }
}

export const MEDICATION_FREQUENCIES = [
  { value: 'once', label: 'Once daily' },
  { value: 'twice', label: 'Twice daily' },
  { value: 'three_times', label: 'Three times daily' },
  { value: 'four_times', label: 'Four times daily' },
  { value: 'as_needed', label: 'As needed' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

export const MEDICATION_UNITS = [
  'mg', 'g', 'ml', 'l', 'mcg', 'units', 'tablets', 'capsules', 'drops', 'puffs', 'patches'
]

export const ADHERENCE_STATUS = {
  EXCELLENT: { value: 'excellent', label: 'Excellent', color: 'green', threshold: 90 },
  GOOD: { value: 'good', label: 'Good', color: 'blue', threshold: 80 },
  FAIR: { value: 'fair', label: 'Fair', color: 'yellow', threshold: 70 },
  POOR: { value: 'poor', label: 'Poor', color: 'red', threshold: 0 }
}

export const ALERT_TYPES = {
  MEDICATION_REMINDER: 'medication_reminder',
  MISSED_DOSE: 'missed_dose',
  FALL_DETECTED: 'fall_detected',
  DISTRESS_CALL: 'distress_call',
  SYSTEM_ERROR: 'system_error'
}

export const ALERT_PRIORITIES = {
  LOW: { value: 'low', label: 'Low', color: 'blue' },
  MEDIUM: { value: 'medium', label: 'Medium', color: 'yellow' },
  HIGH: { value: 'high', label: 'High', color: 'orange' },
  CRITICAL: { value: 'critical', label: 'Critical', color: 'red' }
}

export const REPORT_TYPES = {
  ADHERENCE: 'adherence',
  MEDICATION: 'medication',
  FALL: 'fall',
  COMPREHENSIVE: 'comprehensive'
}

export const REPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv'
}

export const DATE_RANGES = {
  TODAY: { value: 'today', label: 'Today' },
  YESTERDAY: { value: 'yesterday', label: 'Yesterday' },
  LAST_7_DAYS: { value: 'last_7_days', label: 'Last 7 days' },
  LAST_30_DAYS: { value: 'last_30_days', label: 'Last 30 days' },
  LAST_3_MONTHS: { value: 'last_3_months', label: 'Last 3 months' },
  LAST_6_MONTHS: { value: 'last_6_months', label: 'Last 6 months' },
  LAST_YEAR: { value: 'last_year', label: 'Last year' },
  CUSTOM: { value: 'custom', label: 'Custom range' }
}

export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4',
  PURPLE: '#8b5cf6',
  PINK: '#ec4899',
  INDIGO: '#6366f1',
  TEAL: '#14b8a6',
  ORANGE: '#f97316',
  GRAY: '#6b7280'
}

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MEDICATION_REMINDER: 'medication_reminder',
  MISSED_DOSE_ALERT: 'missed_dose_alert',
  FALL_DETECTED: 'fall_detected',
  DISTRESS_CALL: 'distress_call',
  ADHERENCE_UPDATE: 'adherence_update',
  SYSTEM_NOTIFICATION: 'system_notification'
}

export const AUDIO_FILES = {
  ALARM: '/audio/alarm.mp3',
  NOTIFICATION: '/audio/notification.mp3',
  SUCCESS: '/audio/success.mp3',
  ERROR: '/audio/error.mp3',
  WARNING: '/audio/warning.mp3'
}

export const FALL_DETECTION_KEYWORDS = [
  'help',
  'emergency',
  'fall',
  'hurt',
  'pain',
  'ambulance',
  'doctor',
  'hospital',
  '911',
  'assistance'
]

export const PILL_IDENTIFICATION_CONFIDENCE_THRESHOLD = 0.7

export const MAX_FILE_SIZE = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  AUDIO: 50 * 1024 * 1024, // 50MB
  DOCUMENT: 25 * 1024 * 1024 // 25MB
}

export const SUPPORTED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
}

export const DEBOUNCE_DELAY = 300 // milliseconds

export const REFRESH_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
  ADHERENCE: 60000, // 1 minute
  ALERTS: 15000, // 15 seconds
  FALL_MONITORING: 5000 // 5 seconds
}

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings'
}

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ELDERLY: '/elderly',
  ELDERLY_NEW: '/elderly/new',
  ELDERLY_DETAILS: (id) => `/elderly/${id}`,
  ELDERLY_EDIT: (id) => `/elderly/${id}/edit`,
  MEDICATIONS: '/medications',
  MEDICATIONS_NEW: '/medications/new',
  MEDICATIONS_EDIT: (id) => `/medications/${id}/edit`,
  MEDICATIONS_SCHEDULE: '/medications/schedule',
  ADHERENCE: '/adherence',
  ADHERENCE_ALERTS: '/adherence/alerts',
  ADHERENCE_REPORTS: '/adherence/reports',
  REPORTS: '/reports'
}

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNKNOWN: 'An unexpected error occurred.'
}

export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in.',
  LOGOUT: 'Successfully logged out.',
  REGISTER: 'Account created successfully.',
  SAVE: 'Changes saved successfully.',
  DELETE: 'Item deleted successfully.',
  CREATE: 'Item created successfully.',
  UPDATE: 'Item updated successfully.',
  UPLOAD: 'File uploaded successfully.',
  DOWNLOAD: 'File downloaded successfully.',
  SEND: 'Message sent successfully.'
}
