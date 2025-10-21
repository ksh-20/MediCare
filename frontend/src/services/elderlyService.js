import api from './api'

export const elderlyService = {
  async getAllElderly() {
    try {
      const response = await api.get('/elderly')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch elderly patients')
    }
  },

  async getElderlyById(id) {
    try {
      const response = await api.get(`/elderly/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch elderly patient')
    }
  },

  async createElderly(elderlyData) {
    try {
      const response = await api.post('/elderly', elderlyData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create elderly patient')
    }
  },

  async updateElderly(id, elderlyData) {
    try {
      const response = await api.put(`/elderly/${id}`, elderlyData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update elderly patient')
    }
  },

  async deleteElderly(id) {
    try {
      const response = await api.delete(`/elderly/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete elderly patient')
    }
  },

  async getElderlyMedications(id) {
    try {
      const response = await api.get(`/elderly/${id}/medications`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch medications')
    }
  },

  async getElderlyAdherence(id, dateRange) {
    try {
      const response = await api.get(`/elderly/${id}/adherence`, {
        params: dateRange
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch adherence data')
    }
  },

  async getElderlyReports(id, dateRange) {
    try {
      const response = await api.get(`/elderly/${id}/reports`, {
        params: dateRange
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reports')
    }
  }
}
