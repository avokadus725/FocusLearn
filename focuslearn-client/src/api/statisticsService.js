import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7124/api';

const statisticsService = {
  // Отримати детальну статистику користувача
  getUserMethodStatistics: async () => {
    try {
      console.log('Fetching user method statistics...');
      const response = await axios.get(`${API_URL}/UserMethodStatistics`);
      console.log('User method statistics response:', response.data);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching user method statistics:', error);
      if (error.response?.status === 401) {
        throw new Error('Потрібна авторизація');
      }
      return []; // Повертаємо пустий масив замість помилки
    }
  },

  // Отримати загальну статистику за період
  getUserStatistics: async (periodStartDate, periodType) => {
    try {
      console.log('Fetching user statistics for:', { periodStartDate, periodType });
      const response = await axios.get(`${API_URL}/BusinessLogic/user-statistics`, {
        params: { periodStartDate, periodType }
      });
      console.log('User statistics response:', response.data);
      return response.data?.data || { totalConcentrationTime: 0, breakCount: 0, missedBreaks: 0 };
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      if (error.response?.status === 400) {
        console.warn('No data for selected period');
        return { totalConcentrationTime: 0, breakCount: 0, missedBreaks: 0 };
      }
      if (error.response?.status === 401) {
        throw new Error('Потрібна авторизація');
      }
      return { totalConcentrationTime: 0, breakCount: 0, missedBreaks: 0 };
    }
  },

  // Найефективніша методика
  getMostEffectiveMethod: async (periodStartDate, periodType) => {
    try {
      console.log('Fetching most effective method for:', { periodStartDate, periodType });
      const response = await axios.get(`${API_URL}/BusinessLogic/most-effective-method`, {
        params: { periodStartDate, periodType }
      });
      console.log('Most effective method response:', response.data);
      return response.data?.data || { message: 'Недостатньо даних для визначення найефективнішої методики' };
    } catch (error) {
      console.error('Error fetching most effective method:', error);
      if (error.response?.status === 400 || error.response?.status === 500) {
        return { message: 'Недостатньо даних для визначення найефективнішої методики' };
      }
      if (error.response?.status === 401) {
        throw new Error('Потрібна авторизація');
      }
      return { message: 'Недостатньо даних для аналізу' };
    }
  },

  // Коефіцієнт продуктивності
  getProductivityCoefficient: async (periodStartDate, periodType) => {
    try {
      console.log('Fetching productivity coefficient for:', { periodStartDate, periodType });
      const response = await axios.get(`${API_URL}/BusinessLogic/productivity-coefficient`, {
        params: { periodStartDate, periodType }
      });
      console.log('Productivity coefficient response:', response.data);
      return response.data?.data || { productivityCoefficient: 0 };
    } catch (error) {
      console.error('Error fetching productivity coefficient:', error);
      if (error.response?.status === 400 || error.response?.status === 500) {
        return { productivityCoefficient: 0 };
      }
      if (error.response?.status === 401) {
        throw new Error('Потрібна авторизація');
      }
      return { productivityCoefficient: 0 };
    }
  },

  // Прогноз продуктивності
  getPredictProductivity: async (periodStartDate, periodType) => {
    try {
      console.log('Fetching productivity prediction for:', { periodStartDate, periodType });
      const response = await axios.get(`${API_URL}/BusinessLogic/predict-productivity`, {
        params: { periodStartDate, periodType }
      });
      console.log('Productivity prediction response:', response.data);
      return response.data?.data || {
        currentProductivity: 0,
        potentialProductivity: 0,
        improvementPercentage: 0,
        recommendations: ['Почніть використовувати методики концентрації для отримання персоналізованих рекомендацій']
      };
    } catch (error) {
      console.error('Error fetching productivity prediction:', error);
      if (error.response?.status === 400 || error.response?.status === 500) {
        return {
          currentProductivity: 0,
          potentialProductivity: 0,
          improvementPercentage: 0,
          recommendations: ['Недостатньо даних для створення прогнозу. Використовуйте методики концентрації регулярніше.']
        };
      }
      if (error.response?.status === 401) {
        throw new Error('Потрібна авторизація');
      }
      return {
        currentProductivity: 0,
        potentialProductivity: 0,
        improvementPercentage: 0,
        recommendations: []
      };
    }
  }
};

export default statisticsService;