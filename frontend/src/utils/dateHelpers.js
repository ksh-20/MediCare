import { format, parseISO, isValid, addDays, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns'

export const dateHelpers = {
  // Format dates for display
  formatDate(date, formatString = 'MMM dd, yyyy') {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, formatString) : ''
  },

  formatDateTime(date, formatString = 'MMM dd, yyyy HH:mm') {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, formatString) : ''
  },

  formatTime(date, formatString = 'HH:mm') {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, formatString) : ''
  },

  // Get relative time
  getRelativeTime(date) {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return ''

    const now = new Date()
    const diffInMinutes = Math.floor((now - dateObj) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    return this.formatDate(dateObj)
  },

  // Date range helpers
  getDateRange(days = 7) {
    const end = new Date()
    const start = subDays(end, days)
    return { start, end }
  },

  getWeekRange(date = new Date()) {
    const start = startOfDay(subDays(date, date.getDay()))
    const end = endOfDay(addDays(start, 6))
    return { start, end }
  },

  getMonthRange(date = new Date()) {
    const start = startOfDay(new Date(date.getFullYear(), date.getMonth(), 1))
    const end = endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0))
    return { start, end }
  },

  // Check if date is within range
  isDateInRange(date, startDate, endDate) {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
    
    return isWithinInterval(dateObj, { start, end })
  },

  // Medication schedule helpers
  getNextMedicationTime(schedule) {
    if (!schedule || !schedule.times) return null
    
    const now = new Date()
    const today = format(now, 'yyyy-MM-dd')
    
    for (const time of schedule.times) {
      const [hours, minutes] = time.split(':').map(Number)
      const medicationTime = new Date(now)
      medicationTime.setHours(hours, minutes, 0, 0)
      
      if (medicationTime > now) {
        return medicationTime
      }
    }
    
    // If no time today, get first time tomorrow
    const tomorrow = addDays(now, 1)
    const [hours, minutes] = schedule.times[0].split(':').map(Number)
    const tomorrowTime = new Date(tomorrow)
    tomorrowTime.setHours(hours, minutes, 0, 0)
    
    return tomorrowTime
  },

  getMedicationTimesForToday(schedule) {
    if (!schedule || !schedule.times) return []
    
    const now = new Date()
    const today = format(now, 'yyyy-MM-dd')
    
    return schedule.times.map(time => {
      const [hours, minutes] = time.split(':').map(Number)
      const medicationTime = new Date(now)
      medicationTime.setHours(hours, minutes, 0, 0)
      return medicationTime
    }).sort((a, b) => a - b)
  },

  // Adherence calculation helpers
  calculateAdherencePercentage(taken, total) {
    if (total === 0) return 100
    return Math.round((taken / total) * 100)
  },

  getAdherenceStatus(percentage) {
    if (percentage >= 90) return 'excellent'
    if (percentage >= 80) return 'good'
    if (percentage >= 70) return 'fair'
    return 'poor'
  },

  // Age calculation
  calculateAge(birthDate) {
    if (!birthDate) return null
    
    const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate
    if (!isValid(birth)) return null
    
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  },

  // Time zone helpers
  formatTimeWithTimezone(date, timezone = 'local') {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, 'MMM dd, yyyy HH:mm zzz') : ''
  },

  // Validation helpers
  isValidDate(date) {
    if (!date) return false
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj)
  },

  isFutureDate(date) {
    if (!date) return false
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) && dateObj > new Date()
  },

  isPastDate(date) {
    if (!date) return false
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) && dateObj < new Date()
  }
}
