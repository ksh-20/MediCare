import axios from 'axios';

const CHATBOT_BASE = 'http://localhost:8001';
const PILL_BASE = 'http://localhost:8002';
const FALL_BASE = 'http://localhost:8003';

export const aiService = {
  chat: async (message, context = [], user_id = null) => {
    try {
      // Send chat message to Gemini FastAPI backend
      const res = await axios.post(`${CHATBOT_BASE}/chat`, {
        message : message,
        context : context,
        user_id : user_id,
      });
      return res.data;
    } catch (err) {
      console.error('❌ Chatbot error:', err);
      throw new Error('Failed to get response from Gemini API');
    }
  },

  identifyPill: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post(`${PILL_BASE}/identify`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      console.error('❌ Pill identification error:', err);
      throw new Error('Failed to identify pill');
    }
  },

  identifyPillByURL: async (url) => {
    try {
      const res = await axios.post(`${PILL_BASE}/identify-url`, {
        image_url: url,
      });
      return res.data;
    } catch (err) {
      console.error('❌ Pill identification (URL) error:', err);
      throw new Error('Failed to identify pill by URL');
    }
  },

  processAudio: async (file, elderly_id) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('elderly_id', elderly_id);

      const res = await axios.post(`${FALL_BASE}/process-audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      console.error('❌ Fall detection (audio) error:', err);
      throw new Error('Failed to process fall audio');
    }
  },

  startMonitoring: async (elderly_id, sensitivity = 'medium') => {
    try {
      const res = await axios.post(`${FALL_BASE}/monitoring`, {
        elderly_id,
        start_monitoring: true,
        sensitivity,
      });
      return res.data;
    } catch (err) {
      console.error('❌ Fall monitoring start error:', err);
      throw new Error('Failed to start monitoring');
    }
  },

  stopMonitoring: async (elderly_id) => {
    try {
      const res = await axios.post(`${FALL_BASE}/monitoring`, {
        elderly_id,
        start_monitoring: false,
      });
      return res.data;
    } catch (err) {
      console.error('❌ Fall monitoring stop error:', err);
      throw new Error('Failed to stop monitoring');
    }
  },
};
