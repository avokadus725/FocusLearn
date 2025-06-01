import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

import './i18n';

// Імпорт компонентів сторінок
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import AssignmentsPage from './pages/AssignmentsPage/AssignmentsPage'
import MaterialsPage from './pages/MaterialsPage/MaterialsPage';
import MaterialDetailsPage from './pages/MaterialsPage/components/MaterialDetailsPage/MaterialDetailsPage';
import MethodsPage from './pages/MethodsPage/MethodsPage';
import StatisticsPage from './pages/StatisticsPage/StatisticsPage';

// Імпорт стилів
import './styles/global.css';
import './icons/fontawesome';

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
      <Route path="/profile" element={<PrivateRouteElement element={<ProfilePage />} />} />
      <Route path="/assignments" element={<PrivateRouteElement element={<AssignmentsPage />} />} />
      <Route path="/materials" element={<PrivateRouteElement element={<MaterialsPage />} />} />
      <Route path="/materials/:id" element={<PrivateRouteElement element={<MaterialDetailsPage />} />} />
      <Route path="/methods" element={<PrivateRouteElement element={<MethodsPage />} />} />
      <Route path="/statistics" element={<PrivateRouteElement element={<StatisticsPage />} />} />

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