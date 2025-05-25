import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import materialService from '../../api/materialService';
import CreateMaterialModal from './components/CreateMaterialModal';
import EditMaterialModal from './components/EditMaterialModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import './MaterialsPage.css';

const MaterialsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');

  // Стан для модального вікна підтвердження
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
  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await materialService.getAllMaterials();
      console.log('Materials loaded:', data);
      setMaterials(data);
      
    } catch (err) {
      console.error('Error loading materials:', err);
      setError(t('materials.errors.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Ініціалізація
  useEffect(() => {
    loadMaterials();
  }, []);

  // Сортування матеріалів
  const getSortedMaterials = () => {
    const sorted = [...materials].sort((a, b) => {
      const dateA = new Date(a.addedAt || a.createdAt);
      const dateB = new Date(b.addedAt || b.createdAt);
      
      return sortOrder === 'newest' 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
    
    return sorted;
  };

  // Створення нового матеріалу
  const handleCreateMaterial = async (materialData) => {
    try {
      setMessage({ type: '', text: '' });
      
      await materialService.createMaterial(materialData);
      
      setMessage({ 
        type: 'success', 
        text: t('materials.messages.createSuccess') 
      });
      
      setShowCreateModal(false);
      await loadMaterials();
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (err) {
      console.error('Error creating material:', err);
      setMessage({ 
        type: 'error', 
        text: t('materials.errors.createError') 
      });
    }
  };

  // Редагування матеріалу
  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setShowEditModal(true);
  };

  // Збереження редагування
  const handleEditMaterialSubmit = async (materialData) => {
    try {
      setMessage({ type: '', text: '' });
      
      await materialService.updateMaterial(editingMaterial.materialId, materialData);
      
      setMessage({ 
        type: 'success', 
        text: t('materials.messages.updateSuccess') 
      });
      
      setShowEditModal(false);
      setEditingMaterial(null);
      await loadMaterials();
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (err) {
      console.error('Error updating material:', err);
      setMessage({ 
        type: 'error', 
        text: t('materials.errors.updateError') 
      });
    }
  };

  // Відкриття модального вікна підтвердження видалення
  const handleDeleteMaterial = (materialId) => {
    const material = materials.find(m => m.materialId === materialId);
    
    setConfirmModal({
      isOpen: true,
      title: t('materials.delete.title'),
      message: t('materials.delete.message'), 
      confirmText: t('materials.delete.confirm'),
      variant: 'danger',
      action: 'delete',
      materialId: materialId,
      materialTitle: material?.title || '',
      isLoading: false
    });
  };

  // Підтвердження дії
  const handleConfirmAction = async () => {
    if (confirmModal.action === 'delete' && confirmModal.materialId) {
      try {
        // Встановлюємо стан завантаження
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        
        await materialService.deleteMaterial(confirmModal.materialId);
        
        // Закриваємо модальне вікно
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
        
        setMessage({ 
          type: 'success', 
          text: t('materials.messages.deleteSuccess') 
        });
        
        await loadMaterials();
        
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
        
      } catch (err) {
        console.error('Error deleting material:', err);
        
        // Закриваємо модальне вікно та показуємо помилку
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
        
        setMessage({ 
          type: 'error', 
          text: t('materials.errors.deleteError') 
        });
      }
    }
  };

  // Скасування дії
  const handleCancelAction = () => {
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
  };

  // Форматування дати
  const formatDate = (dateString) => {
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
  };

  const sortedMaterials = getSortedMaterials();

  if (loading) {
    return (
      <Layout>
        <div className="materials-loading">
          <div className="materials-loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="materials-page">
        <div className="materials-container">
          
          {/* Заголовок сторінки */}
          <div className="materials-header">
            <div className="materials-title-section">
              <h1 className="materials-title">{t('materials.title')}</h1>
              <p className="materials-subtitle">{t('materials.subtitle')}</p>
            </div>
            
            <div className="materials-header-actions">
              {/* Сортування */}
              <div className="materials-sort">
                <label className="sort-label">{t('materials.sortBy')}:</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">{t('materials.sortOptions.newest')}</option>
                  <option value="oldest">{t('materials.sortOptions.oldest')}</option>
                </select>
              </div>
              
              {/* Кнопка створення для викладачів */}
              {user?.role === 'Tutor' && (
                <button 
                  className="materials-create-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className="fas fa-plus"></i>
                  {t('materials.createNew.button')}
                </button>
              )}
            </div>
          </div>

          {/* Повідомлення */}
          {message.text && (
            <div className={`materials-alert materials-alert-${message.type}`}>
              <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
              {message.text}
            </div>
          )}

          {/* Помилка завантаження */}
          {error && (
            <div className="materials-alert materials-alert-error">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
              <button 
                className="materials-retry-btn"
                onClick={loadMaterials}
              >
                {t('common.retry')}
              </button>
            </div>
          )}

          {/* Список матеріалів */}
          <div className="materials-content">
            {sortedMaterials.length === 0 ? (
              <div className="materials-empty-state">
                <div className="empty-state-icon">
                  <i className="fas fa-book"></i>
                </div>
                <h3 className="empty-state-title">
                  {t('materials.empty.title')}
                </h3>
                <p className="empty-state-description">
                  {t('materials.empty.description')}
                </p>
              </div>
            ) : (
              <div className="materials-list">
                <div className="materials-list-header">
                  <span className="materials-count">
                    {sortedMaterials.length} {t('materials.materialsFound')}
                  </span>
                </div>
                
                <div className="materials-rows">
                  {sortedMaterials.map((material) => (
                    <div key={material.materialId} className="material-row">
                      
                      {/* Основна інформація */}
                      <div className="material-row-main">
                        <div className="material-info">
                          <h3 className="material-title">{material.title}</h3>
                          {material.description && (
                            <p className="material-description">{material.description}</p>
                          )}
                        </div>
                        
                        <div className="material-meta">
                          <div className="meta-item">
                            <i className="fas fa-user"></i>
                            <span>{t('common.autor')}: {material.tutorName}</span>
                          </div>
                          <div className="meta-item">
                            <i className="fas fa-calendar-plus"></i>
                            <span>{t('common.createdAt')}: {formatDate(material.addedAt)}</span>
                          </div>
                          {material.fileLink && (
                            <div className="meta-item">
                              <i className="fas fa-paperclip"></i>
                              <span>Є посилання</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Дії */}
                      <div className="material-row-actions">
                        <Link
                          to={`/materials/${material.materialId}`}
                          className="btn-view-material"
                        >
                          <i className="fas fa-eye"></i>
                          {t('materials.actions.view')}
                        </Link>
                        
                        {/* Кнопки для власних матеріалів викладача */}
                        {user?.role === 'Tutor' && material.creatorId === user.userId && (
                          <>
                            <button
                              className="btn-edit-material"
                              onClick={() => handleEditMaterial(material)}
                              title={t('materials.actions.edit')}
                            >
                              <i className="fas fa-edit"></i>
                              {t('materials.actions.edit')}
                            </button>
                            <button
                              className="btn-delete-material"
                              onClick={() => handleDeleteMaterial(material.materialId)}
                              title={t('materials.actions.delete')}
                            >
                              <i className="fas fa-trash"></i>
                              {t('materials.actions.delete')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальне вікно підтвердження */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.variant}
        icon={confirmModal.variant === 'danger' ? 'fas fa-trash-alt' : 'fas fa-exclamation-triangle'}
        isLoading={confirmModal.isLoading}
      />

      {/* Модальне вікно створення матеріалу */}
      {showCreateModal && (
        <CreateMaterialModal
          onSubmit={handleCreateMaterial}
          onClose={() => setShowCreateModal(false)}
          userRole={user?.role}
        />
      )}

      {/* Модальне вікно редагування матеріалу */}
      {showEditModal && editingMaterial && (
        <EditMaterialModal
          material={editingMaterial}
          onSubmit={handleEditMaterialSubmit}
          onClose={() => {
            setShowEditModal(false);
            setEditingMaterial(null);
          }}
          userRole={user?.role}
        />
      )}
    </Layout>
  );
};

export default MaterialsPage;