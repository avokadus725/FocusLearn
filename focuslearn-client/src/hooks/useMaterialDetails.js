// src/hooks/useMaterialDetails.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import materialService from '../api/materialService';

export const useMaterialDetails = (materialId) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Основні стани
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Стан для модального вікна підтвердження
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    variant: 'danger',
    action: null,
    isLoading: false
  });

  // Завантаження матеріалу
  const loadMaterial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await materialService.getMaterialById(parseInt(materialId));
      console.log('Material loaded:', data);
      setMaterial(data);
      
    } catch (err) {
      console.error('Error loading material:', err);
      setError(t('materials.errors.loadError', 'Помилка завантаження матеріалу'));
    } finally {
      setLoading(false);
    }
  }, [materialId, t]);

  // Показ повідомлення
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
  }, []);

  // Редагування матеріалу
  const handleEditMaterial = useCallback(async (materialData) => {
    try {
      setMessage({ type: '', text: '' });
      
      await materialService.updateMaterial(material.materialId, materialData);
      
      showMessage('success', t('materials.messages.updateSuccess', 'Матеріал оновлено успішно'));
      setShowEditModal(false);
      await loadMaterial(); // Перезавантажуємо дані
      
    } catch (err) {
      console.error('Error updating material:', err);
      showMessage('error', t('materials.errors.updateError', 'Помилка оновлення матеріалу'));
    }
  }, [material, showMessage, loadMaterial, t]);

  // Відкриття модального вікна підтвердження видалення
  const handleDeleteMaterial = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      title: t('materials.delete.title', 'Видалити матеріал'),
      message: t('materials.delete.message', 'Ви впевнені, що хочете видалити цей матеріал?'), 
      confirmText: t('materials.delete.confirm', 'Видалити'),
      variant: 'danger',
      action: 'delete',
      isLoading: false
    });
  }, [t]);

  // Підтвердження дії
  const handleConfirmAction = useCallback(async () => {
    if (confirmModal.action === 'delete') {
      try {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        
        await materialService.deleteMaterial(material.materialId);
        
        setConfirmModal({
          isOpen: false,
          title: '',
          message: '',
          confirmText: '',
          variant: 'danger',
          action: null,
          isLoading: false
        });
        
        showMessage('success', t('materials.messages.deleteSuccess', 'Матеріал видалено успішно'));
        
        // Перенаправляємо на список матеріалів через 1.5 секунди
        setTimeout(() => {
          navigate('/materials');
        }, 1500);
        
      } catch (err) {
        console.error('Error deleting material:', err);
        
        setConfirmModal({
          isOpen: false,
          title: '',
          message: '',
          confirmText: '',
          variant: 'danger',
          action: null,
          isLoading: false
        });
        
        showMessage('error', t('materials.errors.deleteError', 'Помилка видалення матеріалу'));
      }
    }
  }, [confirmModal, material, showMessage, navigate, t]);

  // Скасування дії
  const handleCancelAction = useCallback(() => {
    setConfirmModal({
      isOpen: false,
      title: '',
      message: '',
      confirmText: '',
      variant: 'danger',
      action: null,
      isLoading: false
    });
  }, []);

  // Відкриття модального вікна редагування
  const openEditModal = useCallback(() => {
    setShowEditModal(true);
  }, []);

  // Закриття модального вікна редагування
  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  // Форматування дати
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }, []);

  // Перевірка чи користувач може редагувати/видаляти
  const canEditDelete = useCallback((user) => {
    return user?.role === 'Tutor' && material?.creatorId === user.userId;
  }, [material]);

  // Ініціалізація
  useEffect(() => {
    if (materialId) {
      loadMaterial();
    }
  }, [materialId, loadMaterial]);

  return {
    // Стани
    material,
    loading,
    error,
    message,
    showEditModal,
    confirmModal,
    
    // Дії
    handleEditMaterial,
    handleDeleteMaterial,
    handleConfirmAction,
    handleCancelAction,
    openEditModal,
    closeEditModal,
    
    // Утиліти
    formatDate,
    canEditDelete
  };
};