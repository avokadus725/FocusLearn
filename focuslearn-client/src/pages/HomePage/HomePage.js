import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { getProxiedImageUrl, generateInitialsAvatar, isValidImageUrl } from '../../utils/imageConverter';
import './HomePage.css';

const HomePage = () => {
  const { t } = useTranslation();
  const { user, logout, loading } = useAuth();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  const profileImageUrl = getProxiedImageUrl(user?.profilePhoto);
  const shouldShowImage = profileImageUrl && !imageError && isValidImageUrl(user?.profilePhoto);
  const userInitials = generateInitialsAvatar(user?.userName, user?.email);

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1>FocusLearn</h1>
          
          {/* Селектор мови */}
          <div className="language-selector">
            <select 
              value={currentLanguage} 
              onChange={(e) => changeLanguage(e.target.value)}
              className="language-select"
            >
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="user-menu-container">
            <button 
              className="user-menu-trigger"
              onClick={toggleUserMenu}
            >
              <div className="user-avatar">
                {shouldShowImage ? (
                  <img 
                    src={profileImageUrl} 
                    alt={t('navigation.profile')} 
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {userInitials}
                  </div>
                )}
              </div>
              <span className="user-name">
                {user?.userName || user?.email || t('common.user')}
              </span>
              <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'}`}></i>
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-item">
                  <i className="fas fa-user"></i>
                  {t('navigation.profile')}
                </div>
                <div className="dropdown-item">
                  <i className="fas fa-cog"></i>
                  {t('navigation.settings')}
                </div>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  {t('navigation.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="home-main">
        <div className="welcome-section">
          <h2>{t('welcome.title')} - {t('welcome.subtitle')}</h2>
          
          {user && (
            <div className="welcome-message">
              <div className="user-profile-section">
                <div className="user-info-text">
                  <p>{t('welcome.greeting', { name: user.userName })}</p>
                  {/* <p>{t('welcome.role', { role: user.role })}</p>
                  <p>Email: <strong>{user.email}</strong></p> */}
                </div>
              </div>
            </div>
          )}
          
          <div className="features-grid">
            <div className="feature-card">
              <h3>📚 {t('features.tasks.title')}</h3>
              <p>{t('features.tasks.description')}</p>
            </div>
            
            <div className="feature-card">
              <h3>⏱️ {t('features.focus.title')}</h3>
              <p>{t('features.focus.description')}</p>
            </div>
            
            <div className="feature-card">
              <h3>📊 {t('features.analytics.title')}</h3>
              <p>{t('features.analytics.description')}</p>
            </div>
            
            <div className="feature-card">
              <h3>🎯 {t('features.goals.title')}</h3>
              <p>{t('features.goals.description')}</p>
            </div>
            
            <div className="feature-card">
              <h3>📝 {t('features.notes.title')}</h3>
              <p>{t('features.notes.description')}</p>
            </div>
            
            <div className="feature-card">
              <h3>🏆 {t('features.achievements.title')}</h3>
              <p>{t('features.achievements.description')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;