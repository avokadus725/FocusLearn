import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Layout from '../../components/common/Layout';
import profileService from '../../api/profileService';
import { getProxiedImageUrl, generateInitialsAvatar, isValidImageUrl } from '../../utils/imageConverter';
import './ProfilePage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const { changeLanguage, availableLanguages } = useLanguage();
  
  // Стани
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imageError, setImageError] = useState(false);
  
  // Форма редагування
  const [editForm, setEditForm] = useState({
    userName: '',
    profilePhoto: '',
    language: ''
  });

  // Завантаження даних користувача
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await profileService.getMyProfile();
      setUser(userData);
      setEditForm({
        userName: userData.userName || '',
        profilePhoto: userData.profilePhoto || '',
        language: userData.language || 'uk'
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ 
        type: 'error', 
        text: t('profile.messages.updateError') 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setMessage({ type: '', text: '' });
      
      await profileService.updateMyProfile(editForm);
      
      if (editForm.language !== user.language) {
        await changeLanguage(editForm.language);
      }
      
      await loadUserProfile();
      
      setIsEditing(false);
      setMessage({ 
        type: 'success', 
        text: t('profile.messages.updateSuccess') 
      });
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: t('profile.messages.updateError') 
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      userName: user.userName || '',
      profilePhoto: user.profilePhoto || '',
      language: user.language || 'uk'
    });
    setMessage({ type: '', text: '' });
  };

  const handleDeleteAccount = async () => {
    try {
      await profileService.deleteMyProfile();
      setMessage({ 
        type: 'success', 
        text: t('profile.messages.deleteSuccess') 
      });
      
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ 
        type: 'error', 
        text: t('profile.messages.deleteError') 
      });
    }
    
    setShowDeleteModal(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(t('profile.language'), {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="profile-loading">
          <div className="profile-loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="profile-loading">
          <p>{t('common.error')}</p>
        </div>
      </Layout>
    );
  }

  const profileImageUrl = getProxiedImageUrl(user.profilePhoto);
  const shouldShowImage = profileImageUrl && !imageError && isValidImageUrl(user.profilePhoto);
  const userInitials = generateInitialsAvatar(user.userName, user.email);

  return (
    <Layout>
      <div className="profile-content">

        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">{t('profile.title')}</h1>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <div className={`profile-alert profile-alert-${message.type}`}>
            <FontAwesomeIcon icon={`${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}/>
            {message.text}
          </div>
        )}

        <div className="profile-grid">
          {/* Profile Card - решта контенту залишається без змін */}
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {shouldShowImage ? (
                  <img 
                    src={profileImageUrl} 
                    alt={t('navigation.profile')} 
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {userInitials}
                  </div>
                )}
              </div>
              <h2 className="profile-name">{user.userName || user.email}</h2>
              <p className="profile-email">{user.email}</p>
            </div>

            {/* Решта компонента залишається без змін... */}
            {!isEditing ? (
              <>
                <div className="profile-info-section">
                  <h3 className="profile-section-title">
                    {t('profile.personalInfo')}
                  </h3>
                  
                  <div className="profile-field">
                    <span className="profile-field-label">{t('profile.fields.userName')}</span>
                    <span className="profile-field-value">{user.userName || '-'}</span>
                  </div>
                  
                  <div className="profile-field">
                    <span className="profile-field-label">{t('profile.fields.email')}</span>
                    <span className="profile-field-value">{user.email}</span>
                  </div>
                  
                  <div className="profile-field">
                    <span className="profile-field-label">{t('profile.fields.role')}</span>
                    <span className="profile-field-value">
                      {t(`profile.roles.${user.role}`) || user.role}
                    </span>
                  </div>
                  
                  <div className="profile-field">
                    <span className="profile-field-label">{t('profile.fields.language')}</span>
                    <span className="profile-field-value">
                      {t(`profile.languages.${user.language}`) || user.language}
                    </span>
                  </div>
                  
                  <div className="profile-field">
                    <span className="profile-field-label">{t('profile.fields.status')}</span>
                    <span className="profile-field-value">
                      {t(`profile.statuses.${user.profileStatus}`) || user.profileStatus}
                    </span>
                  </div>
                </div>

                <div className="profile-actions">
                  <button 
                    className="profile-btn profile-btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    {t('profile.editProfile')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="profile-edit-form">
                  <h3 className="profile-section-title">
                    {t('profile.editProfile')}
                  </h3>
                  
                  <div className="profile-form-group">
                    <label className="profile-form-label">
                      {t('profile.fields.userName')}
                    </label>
                    <input
                      type="text"
                      name="userName"
                      value={editForm.userName}
                      onChange={handleInputChange}
                      className="profile-form-input"
                      placeholder={t('profile.placeholders.userName')}
                    />
                  </div>
                  
                  <div className="profile-form-group">
                    <label className="profile-form-label">
                      {t('profile.fields.profilePhoto')}
                    </label>
                    <input
                      type="url"
                      name="profilePhoto"
                      value={editForm.profilePhoto}
                      onChange={handleInputChange}
                      className="profile-form-input"
                      placeholder={t('profile.placeholders.profilePhoto')}
                    />
                  </div>
                  
                  <div className="profile-form-group">
                    <label className="profile-form-label">
                      {t('profile.fields.language')}
                    </label>
                    <select
                      name="language"
                      value={editForm.language}
                      onChange={handleInputChange}
                      className="profile-form-select"
                    >
                      {availableLanguages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="profile-actions">
                  <button 
                    className="profile-btn profile-btn-primary"
                    onClick={handleSaveProfile}
                  >
                    <FontAwesomeIcon icon="save"/>
                    {t('profile.actions.updateProfile')}
                  </button>
                  
                  <button 
                    className="profile-btn profile-btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    <FontAwesomeIcon icon="times"/>
                    {t('profile.actions.cancelEdit')}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Quick Links */}
          <div className="profile-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">
                <FontAwesomeIcon icon="bolt" size="xs"/>
                {t('profile.quickLinks')}
              </h3>
              <div className="sidebar-links">
                <Link to="/statistics" className="sidebar-link">
                  {t('navigation.statistics')}
                </Link>
                <Link to="/methods" className="sidebar-link">
                  {t('navigation.methods')}
                </Link>
                <Link to="/assignments" className="sidebar-link">
                  {t('navigation.assignments')}
                </Link>
              </div>
            </div>

            <div className="sidebar-card danger-zone">
              <h3 className="sidebar-title danger-title">
                <FontAwesomeIcon icon="exclamation-triangle"/>
                {t('profile.dangerZone')}
              </h3>
              <p className="danger-text">{t('profile.dangerZoneText')}</p>
              <button 
                className="profile-btn profile-btn-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                {t('profile.deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="profile-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="profile-modal-title">
              <FontAwesomeIcon icon="exclamation-triangle"/>
              {t('profile.deleteAccount')}
            </h3>
            <p className="profile-modal-text">
              {t('profile.messages.deleteConfirmation')}
            </p>
            <div className="profile-modal-actions">
              <button 
                className="profile-btn profile-btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                {t('common.cancel')}
              </button>
              <button 
                className="profile-btn profile-btn-danger"
                onClick={handleDeleteAccount}
              >
                {t('profile.actions.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProfilePage;