import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getProxiedImageUrl, generateInitialsAvatar, isValidImageUrl } from '../../../utils/imageConverter';
import './Navbar.css';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleImageError = () => setImageError(true);
  const handleImageLoad = () => setImageError(false);
  const handleMenuItemClick = () => setShowUserMenu(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const profileImageUrl = getProxiedImageUrl(user?.profilePhoto);
  const shouldShowImage = profileImageUrl && !imageError && isValidImageUrl(user?.profilePhoto);
  const userInitials = generateInitialsAvatar(user?.userName, user?.email);
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <span className="navbar-title">FocusLearn</span>
        </Link>

        <div className="navbar-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>
            <FontAwesomeIcon icon="home" />
            <span>{t('navigation.home')}</span>
          </Link>

          <Link to="/methods" className={`nav-link ${isActive('/methods') ? 'nav-link-active' : ''}`}>
            <FontAwesomeIcon icon="clock" />
            <span>{t('navigation.methods')}</span>
          </Link>

          <Link to="/assignments" className={`nav-link ${isActive('/assignments') ? 'nav-link-active' : ''}`}>
            <FontAwesomeIcon icon="tasks" />
            <span>{t('navigation.assignments')}</span>
          </Link>

          <Link to="/materials" className={`nav-link ${isActive('/materials') ? 'nav-link-active' : ''}`}>
            <FontAwesomeIcon icon="book" />
            <span>{t('navigation.materials')}</span>
          </Link>
        </div>

        <div className="navbar-right">
          <div className="language-selector">
            <select value={currentLanguage} onChange={(e) => changeLanguage(e.target.value)} className="language-select">
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="user-menu-container">
            <button className="user-menu-trigger" onClick={toggleUserMenu}>
              <div className="user-avatar">
                {shouldShowImage ? (
                  <img src={profileImageUrl} alt={t('navigation.profile')} onError={handleImageError} onLoad={handleImageLoad} />
                ) : (
                  <div className="avatar-placeholder">{userInitials}</div>
                )}
              </div>
              <span className="user-name">{user?.userName || user?.email || t('common.user')}</span>
              <FontAwesomeIcon icon={showUserMenu ? 'chevron-up' : 'chevron-down'} />
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item" onClick={handleMenuItemClick}>
                  <FontAwesomeIcon icon="user" />
                  {t('navigation.profile')}
                </Link>

                <Link to="/statistics" className="dropdown-item" onClick={handleMenuItemClick}>
                  <FontAwesomeIcon icon="chart-bar" />
                  {t('navigation.statistics')}
                </Link>

                <div className="dropdown-divider"></div>

                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <FontAwesomeIcon icon="sign-out-alt" />
                  {t('navigation.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
