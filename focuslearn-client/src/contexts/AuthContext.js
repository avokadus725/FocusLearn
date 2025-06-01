import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../api/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuth, setIsAuth] = useState(authService.isAuthenticated());

  useEffect(() => {
    const checkForToken = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        
        if (token) {
          authService.handleAuthResponse({ token });
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsAuth(true);
          loadUser();
        }
      } catch (err) {
        console.error('Error processing URL token:', err);
      }
    };
    
    checkForToken();
  }, []);

  // Завантаження користувача при ініціалізації
  useEffect(() => {
    if (authService.isAuthenticated()) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

const loadUser = async () => {
  try {
    if (authService.isAuthenticated()) {
      const userData = await authService.getCurrentUser();
      
      const userInfo = userData || null;
      
      //console.log('Processed user:', userInfo);
      
      setUser(userInfo);
      setIsAuth(!!userInfo);
    }
  } catch (error) {
    console.error('Error loading user:', error);
    setError(error.message);
    setIsAuth(false);
    if (error.response && error.response.status === 401) {
      authService.logout();
    }
  } finally {
    setLoading(false);
  }
};

  // Функція для авторизації через Google
  const loginWithGoogle = async () => {
    try {
      await authService.loginWithGoogle();
    } catch (error) {
      setError(error.message);
      console.error("Error logging in with Google", error);
    }
  };

  // Функція для авторизації через Facebook
  const loginWithFacebook = async () => {
    try {
      await authService.loginWithFacebook();
    } catch (error) {
      setError(error.message);
      console.error("Error logging in with Facebook", error);
    }
  };

  // Функція для виходу з системи
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuth(false);
  };

  // Функція для обробки відповіді від OAuth
  const handleAuthResponse = async (response) => {
    try {
      const result = await authService.handleAuthResponse(response);
      if (result) {
        setIsAuth(true);
        await loadUser();
        return true;
      }
      return false;
    } catch (error) {
      setError(error.message);
      console.error("Error handling auth response", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        loginWithGoogle,
        loginWithFacebook,
        logout,
        handleAuthResponse,
        isAuthenticated: isAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Хук для використання контексту аутентифікації
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;