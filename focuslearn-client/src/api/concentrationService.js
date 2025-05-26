import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7124/api';

const concentrationService = {
  // Отримати всі методики концентрації
  getAllMethods: async () => {
    try {
      const response = await axios.get(`${API_URL}/ConcentrationMethods`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching concentration methods:', error);
      throw error;
    }
  },

  // Отримати методику за ID
  getMethodById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/ConcentrationMethods/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching concentration method:', error);
      throw error;
    }
  },

  // Створити нову методику (тільки для адміністраторів)
  createMethod: async (methodData) => {
    try {
      const response = await axios.post(`${API_URL}/ConcentrationMethods`, methodData);
      return response.data;
    } catch (error) {
      console.error('Error creating concentration method:', error);
      throw error;
    }
  },

  // Оновити методику (тільки для адміністраторів)
  updateMethod: async (id, methodData) => {
    try {
      const response = await axios.put(`${API_URL}/ConcentrationMethods/${id}`, methodData);
      return response.data;
    } catch (error) {
      console.error('Error updating concentration method:', error);
      throw error;
    }
  },

  // Видалити методику (тільки для адміністраторів)
  deleteMethod: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/ConcentrationMethods/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting concentration method:', error);
      throw error;
    }
  }
};

export default concentrationService;