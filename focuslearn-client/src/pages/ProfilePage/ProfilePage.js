// src/pages/ProfilePage/ProfilePage.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/common/Layout';
import { useProfile } from '../../hooks/useProfile';
import {
  ProfileHeader,
  ProfileInfoView,
  ProfileEditForm,
  ProfileSidebar,
  DeleteAccountModal
} from '../../components/profile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './ProfilePage.css';

const ProfilePage = () => {
  const { t } = useTranslation();
  
  const {
    // Стан
    user,
    loading,
    isEditing,
    showDeleteModal,
    message,
    editForm,
    availableLanguages,
    
    // Дії
    handleInputChange,
    handleStartEdit,
    handleSaveProfile,
    handleCancelEdit,
    handleShowDeleteModal,
    handleHideDeleteModal,
    handleDeleteAccount,
  } = useProfile();

  if (loading) {
    return (
      <Layout>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="loading">
          <p className="loading-text">{t('common.error')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-xl mx-auto px-4 py-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="heading-1">{t('profile.title')}</h1>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
            <div className="alert-icon">
              <FontAwesomeIcon 
                icon={message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}
              />
            </div>
            <div className="alert-content">
              {message.text}
            </div>
          </div>
        )}

        {/* Profile Layout - використовуємо CSS Grid з пропорціями 2:1 */}
        <div className="profile-container">
          
          {/* Ліва колонка - Profile Card */}
          <div className="profile-main-column">
            <div className="card">
              
              {/* Profile Header */}
              <ProfileHeader user={user} />

              {/* Profile Content */}
              {!isEditing ? (
                <ProfileInfoView 
                  user={user} 
                  onEdit={handleStartEdit} 
                />
              ) : (
                <ProfileEditForm
                  editForm={editForm}
                  availableLanguages={availableLanguages}
                  onInputChange={handleInputChange}
                  onSave={handleSaveProfile}
                  onCancel={handleCancelEdit}
                />
              )}
            </div>
          </div>

          {/* Права колонка - Sidebar */}
          <div className="profile-sidebar-column">
            <ProfileSidebar onDeleteAccount={handleShowDeleteModal} />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={handleHideDeleteModal}
        onConfirm={handleDeleteAccount}
      />
    </Layout>
  );
};

export default ProfilePage;