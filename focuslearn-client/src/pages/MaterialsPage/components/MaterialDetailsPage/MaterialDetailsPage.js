import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import Layout from '../../../../components/common/Layout';
import materialService from '../../../../api/materialService';
import EditMaterialModal from '../EditMaterialModal';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import './MaterialDetailsPage.css';

const MaterialDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
  useEffect(() => {
    loadMaterial();
  }, [id]);

  const loadMaterial = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await materialService.getMaterialById(parseInt(id));
      console.log('Material loaded:', data);
      setMaterial(data);
      
    } catch (err) {
      console.error('Error loading material:', err);
      setError(t('materials.errors.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditMaterial = async (materialData) => {
    try {
      setMessage({ type: '', text: '' });
      
      await materialService.updateMaterial(material.materialId, materialData);
      
      setMessage({ 
        type: 'success', 
        text: t('materials.messages.updateSuccess') 
      });
      
      setShowEditModal(false);
      await loadMaterial(); // Перезавантажуємо дані
      
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
  const handleDeleteMaterial = () => {
    setConfirmModal({
      isOpen: true,
      title: t('materials.delete.title'),
      message: t('materials.delete.message'), 
      confirmText: t('materials.delete.confirm'),
      variant: 'danger',
      action: 'delete',
      isLoading: false
    });
  };

  // Підтвердження дії
  const handleConfirmAction = async () => {
    if (confirmModal.action === 'delete') {
      try {
        // Встановлюємо стан завантаження
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        
        await materialService.deleteMaterial(material.materialId);
        
        // Закриваємо модальне вікно
        setConfirmModal({
          isOpen: false,
          title: '',
          message: '',
          confirmText: '',
          variant: 'danger',
          action: null,
          isLoading: false
        });
        
        setMessage({ 
          type: 'success', 
          text: t('materials.messages.deleteSuccess') 
        });
        
        // Перенаправляємо на список матеріалів через 1.5 секунди
        setTimeout(() => {
          navigate('/materials');
        }, 1500);
        
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
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Перевірка чи користувач може редагувати/видаляти
  const canEditDelete = () => {
    return user?.role === 'Tutor' && material?.creatorId === user.userId;
  };

  if (loading) {
    return (
      <Layout>
        <div className="material-details-loading">
          <div className="material-details-loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  if (error || !material) {
    return (
      <Layout>
        <div className="material-details-error">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="error-title">
            {error || t('materials.errors.notFound')}
          </h2>
          <p className="error-description">
            {t('materials.errors.notFoundDescription')}
          </p>
          <Link to="/materials" className="btn-back-to-list">
            <i className="fas fa-arrow-left"></i>
            {t('materials.backToList')}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="material-details-page">
        <div className="material-details-container">

          {/* Повідомлення */}
          {message.text && (
            <div className={`material-details-alert material-details-alert-${message.type}`}>
              <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
              {message.text}
            </div>
          )}

          {/* Основний контент */}
          <div className="material-details-content">
            
            {/* Заголовок та дії */}
            <div className="material-details-header">
              <div className="material-header-main">
                <h1 className="material-details-title">{material.title}</h1>
                <div className="material-meta-info">
                  <div className="meta-item">
                    <i className="fas fa-user"></i>
                    <span>{t('common.autor')}: {material.tutorName}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-calendar-plus"></i>
                    <span>{t('common.createdAt')} {formatDate(material.addedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="material-header-actions">
                {canEditDelete() && (
                  <>
                    <button
                      className="btn-edit-material-details"
                      onClick={() => setShowEditModal(true)}
                      title={t('materials.actions.edit')}
                    >
                      <i className="fas fa-edit"></i>
                      {t('materials.actions.edit')}
                    </button>
                    <button
                      className="btn-delete-material-details"
                      onClick={handleDeleteMaterial}
                      title={t('materials.actions.delete')}
                    >
                      <i className="fas fa-trash"></i>
                      {t('materials.actions.delete')}
                    </button>                  
                  </>
                )}
                
                <Link to="/materials" className="btn-back-to-materials">
                  <i className="fas fa-arrow-left"></i>
                  {t('materials.backToList')}
                </Link>
              </div>
            </div>

            {/* Контент матеріалу */}
            <div className="material-details-body">
              
              {/* Опис матеріалу */}
              {material.description && (
                <div className="material-description-section">
                  <h2 className="section-title">
                    <i className="fas fa-align-left"></i>
                    {t('materials.fields.description')}
                  </h2>
                  <div className="material-description-content">
                    <p>{material.description}</p>
                  </div>
                </div>
              )}

              {/* Посилання на матеріал */}
              {material.fileLink && (
                <div className="material-link-section">
                  <h2 className="section-title">
                    <i className="fas fa-external-link-alt"></i>
                    {t('materials.fields.fileLink')}
                  </h2>
                  <div className="material-link-content">
                    <a 
                      href={material.fileLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="material-external-link"
                    >
                      <div className="link-info">
                        <div className="link-icon">
                          <i className="fas fa-external-link-alt"></i>
                        </div>
                        <div className="link-details">
                          <span className="link-url">{material.fileLink}</span>
                          <span className="link-description">
                            {t('materials.clickToOpen')}
                          </span>
                        </div>
                      </div>
                      <div className="link-arrow">
                        <i className="fas fa-arrow-right"></i>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>
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

      {/* Модальне вікно редагування матеріалу */}
      {showEditModal && (
        <EditMaterialModal
          material={material}
          onSubmit={handleEditMaterial}
          onClose={() => setShowEditModal(false)}
          userRole={user?.role}
        />
      )}
    </Layout>
  );
};

export default MaterialDetailsPage;