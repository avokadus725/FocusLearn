// src/pages/MaterialsPage/components/MaterialDetailsPage/MaterialDetailsPage.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import Layout from '../../../../components/common/Layout';
import EditMaterialModal from '../EditMaterialModal';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import { useMaterialDetails } from '../../../../hooks/useMaterialDetails';
import './MaterialDetailsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const MaterialDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  
  const {
    material,
    loading,
    error,
    message,
    showEditModal,
    confirmModal,
    handleEditMaterial,
    handleDeleteMaterial,
    handleConfirmAction,
    handleCancelAction,
    openEditModal,
    closeEditModal,
    formatDate,
    canEditDelete
  } = useMaterialDetails(id);

  if (loading) {
    return (
      <Layout>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">{t('common.loading', 'Завантаження...')}</p>
        </div>
      </Layout>
    );
  }

  if (error || !material) {
    return (
      <Layout>
        <div className="material-details-error">
          <div className="error-icon">
            <FontAwesomeIcon icon="exclamation-triangle"/>
          </div>
          <h2 className="heading-2 mb-4">
            {error || t('materials.errors.notFound', 'Матеріал не знайдено')}
          </h2>
          <p className="body-normal text-gray-600 mb-8">
            {t('materials.errors.notFoundDescription', 'Запитуваний матеріал не існує або був видалений')}
          </p>
          <Link to="/materials" className="btn btn-primary">
            <FontAwesomeIcon icon="arrow-left"/>
            {t('materials.backToList', 'Повернутися до списку')}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="material-details-page">
        <div className="container container-lg px-4 py-8">

          {/* Повідомлення */}
          {message.text && (
            <div className={`alert alert-${message.type} mb-6`}>
              <div className="alert-icon">
                <FontAwesomeIcon icon={`${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}/>
              </div>
              <div className="alert-content">
                {message.text}
              </div>
            </div>
          )}

          {/* Основний контент */}
          <div className="card material-details-content">
            
            {/* Заголовок та дії */}
            <div className="material-details-header">
              <div className="material-header-main">
                <h1 className="material-details-title">{material.title}</h1>
                <div className="material-meta-info">
                  <div className="meta-item">
                    <FontAwesomeIcon icon="user"/>
                    <span>{t('common.autor', 'Автор')}: {material.tutorName}</span>
                  </div>
                  <div className="meta-item">
                    <FontAwesomeIcon icon="calendar-alt"/>
                    <span>{t('common.createdAt', 'Створено')} {formatDate(material.addedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="material-header-actions">
                {canEditDelete(user) && (
                  <>
                    <button
                      className="btn btn-secondary btn-edit-material-details"
                      onClick={openEditModal}
                      title={t('materials.actions.edit', 'Редагувати')}
                    >
                      <FontAwesomeIcon icon="edit"/>
                      {t('materials.actions.edit', 'Редагувати')}
                    </button>
                    <button
                      className="btn btn-danger btn-delete-material-details"
                      onClick={handleDeleteMaterial}
                      title={t('materials.actions.delete', 'Видалити')}
                    >
                      <FontAwesomeIcon icon="trash"/>
                      {t('materials.actions.delete', 'Видалити')}
                    </button>                  
                  </>
                )}
                
                <Link to="/materials" className="btn btn-outline btn-back-to-materials">
                  <FontAwesomeIcon icon="arrow-left"/>
                  {t('materials.backToList', 'Назад до списку')}
                </Link>
              </div>
            </div>

            {/* Контент матеріалу */}
            <div className="card-body material-details-body">
              
              {/* Опис матеріалу */}
              {material.description && (
                <div className="material-description-section">
                  <h2 className="heading-4 section-title mb-4">
                    <FontAwesomeIcon icon="align-left"/>
                    {t('materials.fields.description', 'Опис')}
                  </h2>
                  <div className="material-description-content">
                    <p className="body-normal">{material.description}</p>
                  </div>
                </div>
              )}

              {/* Посилання на матеріал */}
              {material.fileLink && (
                <div className="material-link-section">
                  <h2 className="heading-4 section-title mb-4">
                    <FontAwesomeIcon icon="external-link-alt"/>
                    {t('materials.fields.fileLink', 'Посилання на матеріал')}
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
                          <FontAwesomeIcon icon="external-link-alt"/>
                        </div>
                        <div className="link-details">
                          <span className="link-url">{material.fileLink}</span>
                          <span className="link-description">
                            {t('materials.clickToOpen', 'Натисніть, щоб відкрити')}
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
          onClose={closeEditModal}
          userRole={user?.role}
        />
      )}
    </Layout>
  );
};

export default MaterialDetailsPage;