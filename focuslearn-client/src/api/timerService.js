import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7124/api';

const timerService = {
  // Запустити нову сесію
  startSession: async (methodId) => {
    try {      
      const requestData = {
        MethodId: methodId
      };
      
      const response = await axios.post(`${API_URL}/Timer/start`, requestData);      
      return response.data;
    } catch (error) {
      console.error('Error message:', error.message);      
      throw error;
    }
  },

  // Отримати статус поточної сесії
  getSessionStatus: async () => {
    try {
      const response = await axios.get(`${API_URL}/Timer/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting session status:', error);
      throw error;
    }
  },

  // Поставити на паузу / відновити
  pauseSession: async () => {
    try {
      const response = await axios.post(`${API_URL}/Timer/pause`);
      return response.data;
    } catch (error) {
      console.error('Error pausing session:', error);
      throw error;
    }
  },

  // Завершити сесію
  stopSession: async () => {
    try {
      const response = await axios.post(`${API_URL}/Timer/stop`);
      return response.data;
    } catch (error) {
      console.error('Error stopping session:', error);
      throw error;
    }
  },

  // Завершити поточну фазу
  completePhase: async () => {
    try {
      const response = await axios.post(`${API_URL}/Timer/complete-phase`);
      return response.data;
    } catch (error) {
      console.error('Error completing phase:', error);
      throw error;
    }
  }
};

export default timerService;