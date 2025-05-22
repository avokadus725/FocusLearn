import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7124/api';

const profileService = {
  // Отримати профіль поточного користувача
  getMyProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/Users/my-profile`);
      
      // Обробляємо відповідь з LocalizedResponseDTO якщо необхідно
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },

  // Оновити профіль поточного користувача
  updateMyProfile: async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/Users/my-profile`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Видалити акаунт поточного користувача
  deleteMyProfile: async () => {
    try {
      const response = await axios.delete(`${API_URL}/Users/my-profile`);
      return response.data;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  },

  // Змінити мову користувача
  changeLanguage: async (language) => {
    try {
      const response = await axios.post(`${API_URL}/Localization/change-user-language?language=${language}`);
      return response.data;
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    }
  }
};

export default profileService;