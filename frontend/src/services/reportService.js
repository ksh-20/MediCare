import api from './api'

export const reportService = {
  async generateAdherenceReport(elderlyId, dateRange) {
    try {
      const response = await api.post('/reports/adherence', {
        elderlyId,
        dateRange
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate adherence report')
    }
  },

  async generateMedicationReport(elderlyId, dateRange) {
    try {
      const response = await api.post('/reports/medication', {
        elderlyId,
        dateRange
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate medication report')
    }
  },

  async generateFallReport(elderlyId, dateRange) {
    try {
      const response = await api.post('/reports/fall', {
        elderlyId,
        dateRange
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate fall report')
    }
  },

  async generateComprehensiveReport(elderlyId, dateRange) {
    try {
      const response = await api.post('/reports/comprehensive', {
        elderlyId,
        dateRange
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate comprehensive report')
    }
  },

  async downloadReport(reportId, format = 'pdf') {
    try {
      const response = await api.get(`/reports/${reportId}/download`, {
        params: { format },
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download report')
    }
  },

  async getReportHistory(elderlyId) {
    try {
      const response = await api.get(`/reports/history/${elderlyId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get report history')
    }
  },

  async scheduleReport(elderlyId, reportType, schedule) {
    try {
      const response = await api.post('/reports/schedule', {
        elderlyId,
        reportType,
        schedule
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to schedule report')
    }
  }
}
