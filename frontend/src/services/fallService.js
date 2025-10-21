import axios from 'axios'

const FALL_DETECTION_URL = import.meta.env.VITE_AI_FALL_URL || 'http://localhost:8003'

const fallApi = axios.create({
  baseURL: FALL_DETECTION_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const fallService = {
  async startFallMonitoring(elderlyId) {
    try {
      const response = await fallApi.post('/start-monitoring', {
        elderly_id: elderlyId
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to start fall monitoring')
    }
  },

  async stopFallMonitoring(elderlyId) {
    try {
      const response = await fallApi.post('/stop-monitoring', {
        elderly_id: elderlyId
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to stop fall monitoring')
    }
  },

  async processAudio(audioBlob, elderlyId) {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)
      formData.append('elderly_id', elderlyId)

      const response = await fallApi.post('/process-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to process audio')
    }
  },

  async getFallHistory(elderlyId, dateRange) {
    try {
      const response = await fallApi.get(`/fall-history/${elderlyId}`, {
        params: dateRange
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get fall history')
    }
  },

  async updateFallIncident(incidentId, data) {
    try {
      const response = await fallApi.put(`/fall-incident/${incidentId}`, data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update fall incident')
    }
  },

  async getDistressKeywords() {
    try {
      const response = await fallApi.get('/distress-keywords')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get distress keywords')
    }
  },

  async addDistressKeyword(keyword) {
    try {
      const response = await fallApi.post('/distress-keywords', {
        keyword
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add distress keyword')
    }
  }
}
