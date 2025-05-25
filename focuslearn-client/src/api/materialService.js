// materialService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7124/api';

const materialService = {
  // Отримати всі матеріали
  getAllMaterials: async () => {
    try {
      const response = await axios.get(`${API_URL}/LearningMaterials`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching all learning materials:', error);
      throw error;
    }
  },

  // Отримати матеріали поточного користувача (репетитора)
  getMyMaterials: async () => {
    try {
      const response = await axios.get(`${API_URL}/LearningMaterials/my-materials`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching my learning materials:', error);
      throw error;
    }
  },

  // Отримати матеріал за ID
  getMaterialById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/LearningMaterials/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching learning material:', error);
      throw error;
    }
  },

  // Створити новий матеріал
  createMaterial: async (materialData) => {
    try {
      const response = await axios.post(`${API_URL}/LearningMaterials`, materialData);
      return response.data;
    } catch (error) {
      console.error('Error creating learning material:', error);
      throw error;
    }
  },

  // Оновити матеріал
  updateMaterial: async (id, materialData) => {
    try {
      const response = await axios.put(`${API_URL}/LearningMaterials/${id}`, materialData);
      return response.data;
    } catch (error) {
      console.error('Error updating learning material:', error);
      throw error;
    }
  },

  // Видалити матеріал
  deleteMaterial: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/LearningMaterials/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting learning material:', error);
      throw error;
    }
  }
};

export default materialService;