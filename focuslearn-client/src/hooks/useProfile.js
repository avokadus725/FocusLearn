// src/hooks/useProfile.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import profileService from '../api/profileService';

export const useProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { changeLanguage, availableLanguages } = useLanguage();
  
  // Стани
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
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
      showMessage('error', t('profile.messages.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setMessage({ type: '', text: '' });
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
      showMessage('success', t('profile.messages.updateSuccess'));
      
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', t('profile.messages.updateError'));
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      userName: user?.userName || '',
      profilePhoto: user?.profilePhoto || '',
      language: user?.language || 'uk'
    });
    setMessage({ type: '', text: '' });
  };

  const handleShowDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleHideDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteAccount = async () => {
    try {
      await profileService.deleteMyProfile();
      showMessage('success', t('profile.messages.deleteSuccess'));
      
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      showMessage('error', t('profile.messages.deleteError'));
    }
    
    setShowDeleteModal(false);
  };

  return {
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
  };
};