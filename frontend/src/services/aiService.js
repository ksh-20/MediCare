import axios from 'axios';

const CHATBOT_BASE = 'http://localhost:8001';
const PILL_BASE = 'http://localhost:8002';
const FALL_BASE = 'http://localhost:8003';

export const aiService = {
  // Chatbot
  chat: async (message, context = {}, user_id = null) => {
    const res = await axios.post(`${CHATBOT_BASE}/chat`, { message, context, user_id });
    return res.data;
  },

  // Pill Identification
  identifyPill: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${PILL_BASE}/identify`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  identifyPillByURL: async (url) => {
    const res = await axios.post(`${PILL_BASE}/identify-url`, { image_url: url });
    return res.data;
  },

  // Fall Detection
  processAudio: async (file, elderly_id) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('elderly_id', elderly_id);
    const res = await axios.post(`${FALL_BASE}/process-audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  startMonitoring: async (elderly_id, sensitivity = 'medium') => {
    const res = await axios.post(`${FALL_BASE}/monitoring`, { elderly_id, start_monitoring: true, sensitivity });
    return res.data;
  },

  stopMonitoring: async (elderly_id) => {
    const res = await axios.post(`${FALL_BASE}/monitoring`, { elderly_id, start_monitoring: false });
    return res.data;
  },
};
