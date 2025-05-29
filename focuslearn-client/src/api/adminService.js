import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7124/api';

const adminService = {
  // Отримати всіх користувачів
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/Users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Змінити статус користувача
  changeUserStatus: async (userId, status) => {
    try {
      const response = await axios.post(`${API_URL}/Admin/change-user-status?userId=${userId}&status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Error changing user status:', error);
      throw error;
    }
  },

  // Експорт даних
  exportData: async (tableNames) => {
    try {
      const response = await axios.post(`${API_URL}/Admin/export-data`, tableNames, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },

  // Імпорт даних
  importData: async (tableName, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_URL}/Admin/import-data?tableName=${tableName}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  },

  // Бекап бази даних
  backupDatabase: async () => {
    try {
      const response = await axios.post(`${API_URL}/Admin/backup-database`);
      return response.data;
    } catch (error) {
      console.error('Error backing up database:', error);
      throw error;
    }
  },

  // Відновлення бази даних
  restoreDatabase: async (customPath = null) => {
    try {
      const url = customPath 
        ? `${API_URL}/Admin/restore-database?customPath=${encodeURIComponent(customPath)}`
        : `${API_URL}/Admin/restore-database`;
      
      const response = await axios.post(url);
      return response.data;
    } catch (error) {
      console.error('Error restoring database:', error);
      throw error;
    }
  }
};

export default adminService;