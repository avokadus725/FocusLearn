import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7124/api';

const statisticsService = {
  getUserMethodStatistics: async () => {
    try {
      const response = await axios.get(`${API_URL}/UserMethodStatistics`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching user method statistics:', error);
      if (error.response?.status === 401) {
        throw new Error('Потрібна авторизація');
      }
      return [];
    }
  },

  // Отримати загальну статистику за період
  getUserStatistics: async (periodStartDate, periodType) => {
    try {
      const response = await axios.get(`${API_URL}/BusinessLogic/user-statistics`, {
        params: { periodStartDate, periodType }
      });
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
      const response = await axios.get(`${API_URL}/BusinessLogic/most-effective-method`, {
        params: { periodStartDate, periodType }
      });
      return response.data?.data || { message: 'Недостатньо даних для визначення найефективнішої методики' };
    } catch (error) {
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
      const response = await axios.get(`${API_URL}/BusinessLogic/productivity-coefficient`, {
        params: { periodStartDate, periodType }
      });
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
      const response = await axios.get(`${API_URL}/BusinessLogic/predict-productivity`, {
        params: { periodStartDate, periodType }
      });
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