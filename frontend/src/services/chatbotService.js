import axios from 'axios'

const CHATBOT_URL = import.meta.env.VITE_AI_CHATBOT_URL || 'http://localhost:8001'

const chatbotApi = axios.create({
  baseURL: CHATBOT_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const chatbotService = {
  async sendMessage(message, context = {}) {
    try {
      const response = await chatbotApi.post('/chat', {
        message,
        context
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get chatbot response')
    }
  },

  async getDrugInfo(drugName) {
    try {
      const response = await chatbotApi.get(`/drug-info/${encodeURIComponent(drugName)}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get drug information')
    }
  },

  async checkDrugInteractions(drugs) {
    try {
      const response = await chatbotApi.post('/check-interactions', {
        drugs
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check drug interactions')
    }
  },

  async getDosageInfo(drugName, condition) {
    try {
      const response = await chatbotApi.post('/dosage-info', {
        drugName,
        condition
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get dosage information')
    }
  },

  async getSideEffects(drugName) {
    try {
      const response = await chatbotApi.get(`/side-effects/${encodeURIComponent(drugName)}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get side effects')
    }
  }
}
