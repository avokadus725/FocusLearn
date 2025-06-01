import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7124/api';

// Утиліта для роботи з токенами
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
    
    console.log('Token set:', token.substring(0, 15) + '...');
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

const initializeToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    console.log(token);
    setAuthToken(token);
  }
};

initializeToken();

// Сервіс для автентифікації
const authService = {
  // Авторизація через Google
  loginWithGoogle: () => {
    window.location.href = `${API_URL}/Auth/login-google`;
    return Promise.resolve();
  },

  // Авторизація через Facebook
  loginWithFacebook: () => {
    window.location.href = `${API_URL}/Auth/login-facebook`;
    return Promise.resolve();
  },

  handleAuthResponse: (response) => {
    if (response && response.token) {
      setAuthToken(response.token);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  // Перевірка чи авторизований користувач
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Вихід з системи
  logout: () => {
    setAuthToken(null);
  },

// Отримання інформації про користувача
getCurrentUser: async () => {
  if (!authService.isAuthenticated()) {
    return null;
  }

  try {   
    const response = await axios.get(`${API_URL}/Users/my-profile`);
    console.log('API Response:', response.data);
    
    if (response.data && response.data.data) {
      return response.data.data; 
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    if (error.response && error.response.status === 401) {
      console.log('Token invalid, logging out');
      authService.logout();
    }
    throw error;
  }
},

updateUserLanguage: async (language) => {
  try {
    await axios.put(`${API_URL}/Users/my-profile/language`, { language });
  } catch (error) {
    console.error('Error updating user language:', error);
  }
}
};

export default authService;