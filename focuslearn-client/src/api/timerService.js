import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7124/api';

const timerService = {
  // Запустити нову сесію
  startSession: async (methodId) => {
    try {
      console.log('=== Timer Service Debug ===');
      console.log('API_URL:', API_URL);
      console.log('Starting session with methodId:', methodId);
      console.log('Type of methodId:', typeof methodId);
      
      const requestData = {
        MethodId: methodId
      };
      
      console.log('Request data:', requestData);
      console.log('Request URL:', `${API_URL}/Timer/start`);
      
      const response = await axios.post(`${API_URL}/Timer/start`, requestData);
      
      console.log('Session started successfully!');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('=== Timer Service Error ===');
      console.error('Error object:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response statusText:', error.response.statusText);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);
        console.error('Response data as JSON:', JSON.stringify(error.response.data, null, 2));
        
        // Якщо є вкладені дані
        if (error.response.data && error.response.data.data) {
          console.error('Nested error data:', error.response.data.data);
          console.error('Nested error data as JSON:', JSON.stringify(error.response.data.data, null, 2));
        }
      } else if (error.request) {
        console.error('Request was made but no response received');
        console.error('Request:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
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