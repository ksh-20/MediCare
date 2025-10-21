import api from './api'

export const medicationService = {
  async getAllMedications() {
    try {
      const response = await api.get('/medications')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch medications')
    }
  },

  async getMedicationById(id) {
    try {
      const response = await api.get(`/medications/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch medication')
    }
  },

  async createMedication(medicationData) {
    try {
      const response = await api.post('/medications', medicationData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create medication')
    }
  },

  async updateMedication(id, medicationData) {
    try {
      const response = await api.put(`/medications/${id}`, medicationData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update medication')
    }
  },

  async deleteMedication(id) {
    try {
      const response = await api.delete(`/medications/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete medication')
    }
  },

  async getMedicationSchedule(elderlyId) {
    try {
      const response = await api.get(`/medications/schedule/${elderlyId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch medication schedule')
    }
  },

  async updateMedicationSchedule(scheduleId, scheduleData) {
    try {
      const response = await api.put(`/medications/schedule/${scheduleId}`, scheduleData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update medication schedule')
    }
  },

  async logMedicationTaken(medicationId, elderlyId, takenAt) {
    try {
      const response = await api.post('/medications/log-taken', {
        medicationId,
        elderlyId,
        takenAt
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to log medication taken')
    }
  },

  async getMedicationAdherence(medicationId, dateRange) {
    try {
      const response = await api.get(`/medications/${medicationId}/adherence`, {
        params: dateRange
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch medication adherence')
    }
  },

  async searchMedications(query) {
    try {
      const response = await api.get('/medications/search', {
        params: { q: query }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search medications')
    }
  }
}
