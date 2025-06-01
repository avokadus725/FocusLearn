// src/hooks/useMaterials.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import materialService from '../api/materialService';

export const useMaterials = () => {
  const { t } = useTranslation();
  
  // Основні стани
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Стани модальних вікон
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    variant: 'danger',
    action: null,
    materialId: null,
    materialTitle: '',
    isLoading: false
  });

  // Завантаження матеріалів
  const loadMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await materialService.getAllMaterials();
      setMaterials(data);
      
    } catch (err) {
      setError(t('materials.errors.loadError', 'Помилка завантаження матеріалів'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Показ повідомлення
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
  }, []);

  // Сортування матеріалів
  const getSortedMaterials = useCallback(() => {
    const sorted = [...materials].sort((a, b) => {
      const dateA = new Date(a.addedAt || a.createdAt);
      const dateB = new Date(b.addedAt || b.createdAt);
      
      return sortOrder === 'newest' 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
    
    return sorted;
  }, [materials, sortOrder]);

  // Створення нового матеріалу
  const handleCreateMaterial = useCallback(async (materialData) => {
    try {
      setMessage({ type: '', text: '' });
      
      await materialService.createMaterial(materialData);
      
      showMessage('success', t('materials.messages.createSuccess', 'Матеріал створено успішно'));
      setShowCreateModal(false);
      await loadMaterials();
      
    } catch (err) {
      showMessage('error', t('materials.errors.createError', 'Помилка створення матеріалу'));
    }
  }, [showMessage, loadMaterials, t]);

  // Початок редагування
  const handleEditMaterial = useCallback((material) => {
    setEditingMaterial(material);
    setShowEditModal(true);
  }, []);

  // Збереження редагування
  const handleEditMaterialSubmit = useCallback(async (materialData) => {
    try {
      setMessage({ type: '', text: '' });
      
      await materialService.updateMaterial(editingMaterial.materialId, materialData);
      
      showMessage('success', t('materials.messages.updateSuccess', 'Матеріал оновлено успішно'));
      setShowEditModal(false);
      setEditingMaterial(null);
      await loadMaterials();
      
    } catch (err) {
      console.error('Error updating material:', err);
      showMessage('error', t('materials.errors.updateError', 'Помилка оновлення матеріалу'));
    }
  }, [editingMaterial, showMessage, loadMaterials, t]);

  // Відкриття модального вікна підтвердження видалення
  const handleDeleteMaterial = useCallback((materialId) => {
    const material = materials.find(m => m.materialId === materialId);
    
    setConfirmModal({
      isOpen: true,
      title: t('materials.delete.title', 'Видалити матеріал'),
      message: t('materials.delete.message', 'Ви впевнені, що хочете видалити цей матеріал?'), 
      confirmText: t('materials.delete.confirm', 'Видалити'),
      variant: 'danger',
      action: 'delete',
      materialId: materialId,
      materialTitle: material?.title || '',
      isLoading: false
    });
  }, [materials, t]);

  // Підтвердження дії
  const handleConfirmAction = useCallback(async () => {
    if (confirmModal.action === 'delete' && confirmModal.materialId) {
      try {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        
        await materialService.deleteMaterial(confirmModal.materialId);
        
        setConfirmModal({
          isOpen: false,
          title: '',
          message: '',
          confirmText: '',
          variant: 'danger',
          action: null,
          materialId: null,
          materialTitle: '',
          isLoading: false
        });
        
        showMessage('success', t('materials.messages.deleteSuccess', 'Матеріал видалено успішно'));
        await loadMaterials();
        
      } catch (err) {
        console.error('Error deleting material:', err);
        
        setConfirmModal({
          isOpen: false,
          title: '',
          message: '',
          confirmText: '',
          variant: 'danger',
          action: null,
          materialId: null,
          materialTitle: '',
          isLoading: false
        });
        
        showMessage('error', t('materials.errors.deleteError', 'Помилка видалення матеріалу'));
      }
    }
  }, [confirmModal, showMessage, loadMaterials, t]);

  // Скасування дії
  const handleCancelAction = useCallback(() => {
    setConfirmModal({
      isOpen: false,
      title: '',
      message: '',
      confirmText: '',
      variant: 'danger',
      action: null,
      materialId: null,
      materialTitle: '',
      isLoading: false
    });
  }, []);

  // Зміна сортування
  const handleSortChange = useCallback((newSortOrder) => {
    setSortOrder(newSortOrder);
  }, []);

  // Відкриття модального вікна створення
  const openCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  // Закриття модального вікна створення
  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  // Закриття модального вікна редагування
  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingMaterial(null);
  }, []);

  // Перезавантаження матеріалів
  const retryLoading = useCallback(() => {
    loadMaterials();
  }, [loadMaterials]);

  // Форматування дати
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, []);

  // Ініціалізація
  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  return {
    // Стани
    materials: getSortedMaterials(),
    loading,
    error,
    message,
    sortOrder,
    showCreateModal,
    showEditModal,
    editingMaterial,
    confirmModal,
    
    // Дії
    handleCreateMaterial,
    handleEditMaterial,
    handleEditMaterialSubmit,
    handleDeleteMaterial,
    handleConfirmAction,
    handleCancelAction,
    handleSortChange,
    openCreateModal,
    closeCreateModal,
    closeEditModal,
    retryLoading,
    
    // Утиліти
    formatDate
  };
};