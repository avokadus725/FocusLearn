import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Імпорт i18n конфігурації (ВАЖЛИВО: перед всіма компонентами)
import './i18n';

// Імпорт компонентів сторінок
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';

// Імпорт стилів
import './styles/global.css';

// Компонент завантаження для Suspense
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Завантаження...</p>
  </div>
);

// Приватний маршрут
const PrivateRouteElement = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  return isAuthenticated ? element : <Navigate to="/login" />;
};

// Компонент маршрутів
const AppRoutes = () => {
  return (
    <Routes>
      {/* Публічні маршрути */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Захищені маршрути */}
      <Route path="/" element={<PrivateRouteElement element={<HomePage />} />} />
      
      {/* Перенаправлення на login для невідомих маршрутів */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

// Головний компонент
function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Router>
        <LanguageProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LanguageProvider>
      </Router>
    </Suspense>
  );
}

export default App;