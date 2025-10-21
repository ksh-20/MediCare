import axios from 'axios'

const PILL_ID_URL = import.meta.env.VITE_AI_PILL_URL || 'http://localhost:8002'

const pillApi = axios.create({
  baseURL: PILL_ID_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const pillService = {
  async identifyPill(imageFile) {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const response = await pillApi.post('/identify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to identify pill')
    }
  },

  async identifyPillFromUrl(imageUrl) {
    try {
      const response = await pillApi.post('/identify-url', {
        image_url: imageUrl
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to identify pill from URL')
    }
  },

  async getPillDetails(pillId) {
    try {
      const response = await pillApi.get(`/pill-details/${pillId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get pill details')
    }
  },

  async searchPillsByDescription(description) {
    try {
      const response = await pillApi.post('/search-by-description', {
        description
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search pills by description')
    }
  },

  async getPillInteractions(pillIds) {
    try {
      const response = await pillApi.post('/interactions', {
        pill_ids: pillIds
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get pill interactions')
    }
  }
}
