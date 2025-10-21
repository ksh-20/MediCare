import api from './api'

const reportService = {
  // Generate adherence report
  generateAdherenceReport: async (elderlyId, params = {}) => {
    try {
      const response = await api.get(`/reports/adherence/${elderlyId}`, { params })
      return response.data
    } catch (error) {
      console.error('Error generating adherence report:', error)
      throw error
    }
  },

  // Generate medication report
  generateMedicationReport: async (elderlyId, params = {}) => {
    try {
      const response = await api.get(`/reports/medication/${elderlyId}`, { params })
      return response.data
    } catch (error) {
      console.error('Error generating medication report:', error)
      throw error
    }
  },

  // Generate comprehensive report
  generateComprehensiveReport: async (elderlyId, params = {}) => {
    try {
      const response = await api.get(`/reports/comprehensive/${elderlyId}`, { params })
      return response.data
    } catch (error) {
      console.error('Error generating comprehensive report:', error)
      throw error
    }
  },

  // Download report
  downloadReport: async (elderlyId, params = {}) => {
    try {
      const response = await api.get(`/reports/download/${elderlyId}`, { 
        params,
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error downloading report:', error)
      throw error
    }
  },

  // Get report history
  getReportHistory: async (params = {}) => {
    try {
      const response = await api.get('/reports/history', { params })
      return response.data
    } catch (error) {
      console.error('Error getting report history:', error)
      throw error
    }
  },

  // Delete report
  deleteReport: async (reportId) => {
    try {
      const response = await api.delete(`/reports/${reportId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting report:', error)
      throw error
    }
  }
}

export { reportService }