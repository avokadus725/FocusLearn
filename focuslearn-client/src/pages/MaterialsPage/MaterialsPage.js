// src/pages/MaterialsPage/MaterialsPage.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import CreateMaterialModal from './components/CreateMaterialModal';
import EditMaterialModal from './components/EditMaterialModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useMaterials } from '../../hooks/useMaterials';
import './MaterialsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const MaterialsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const {
    materials,
    loading,
    error,
    message,
    sortOrder,
    showCreateModal,
    showEditModal,
    editingMaterial,
    confirmModal,
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
    formatDate
  } = useMaterials();

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

  return (
    <Layout>
      <div className="materials-page">
        <div className="container container-xl px-4 py-8">
          
          {/* Заголовок сторінки */}
          <div className="materials-header">
            <div className="materials-title-section">
              <h1 className="heading-1 mb-2">
                {t('materials.title', 'Навчальні матеріали')}
              </h1>
              <p className="body-large text-gray-600">
                {t('materials.subtitle', 'Корисні ресурси для навчання')}
              </p>
            </div>
            
            <div className="materials-header-actions">
              {/* Сортування */}
              <div className="materials-sort">
                <label className="sort-label">{t('materials.sortBy', 'Сортувати за')}:</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">{t('materials.sortOptions.newest', 'Найновіші')}</option>
                  <option value="oldest">{t('materials.sortOptions.oldest', 'Найстаріші')}</option>
                </select>
              </div>
              
                    { /* Кнопка створення для викладачів */ }
                      {user?.role === 'Tutor' && (
                      <button 
                        className="btn btn-primary materials-create-btn"
                        onClick={openCreateModal}
                      >
                        <FontAwesomeIcon icon="plus" />
                        {t('materials.createNew.button', 'Створити матеріал')}
                      </button>
                      )}
                    </div>
                    </div>

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

          {/* Помилка завантаження */}
          {error && (
            <div className="alert alert-danger mb-6">
              <div className="alert-icon">
                <FontAwesomeIcon icon="exclamation-triangle"/>
              </div>
              <div className="alert-content">
                {error}
              </div>
              <button 
                className="btn btn-outline btn-sm ml-auto"
                onClick={retryLoading}
              >
                {t('common.retry', 'Спробувати знову')}
              </button>
            </div>
          )}

          {/* Список матеріалів */}
          <div className="materials-content">
            {materials.length === 0 ? (
              <div className="materials-empty-state">
                <div className="empty-state-icon">
                  <FontAwesomeIcon icon="book"/>
                </div>
                <h3 className="heading-3 mb-2">
                  {t('materials.empty.title', 'Матеріали відсутні')}
                </h3>
                <p className="body-normal text-gray-500">
                  {t('materials.empty.description', 'На даний момент матеріали недоступні')}
                </p>
              </div>
            ) : (
              <div className="materials-list">
                <div className="card mb-4">
                  <div className="card-body">
                    <span className="materials-count">
                      {materials.length} {t('materials.materialsFound', 'матеріалів знайдено')}
                    </span>
                  </div>
                </div>
                
                <div className="card">
                  <div className="materials-rows">
                    {materials.map((material) => (
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
                              <FontAwesomeIcon icon="user"/>
                              <span>{t('common.autor', 'Автор')}: {material.tutorName}</span>
                            </div>
                            <div className="meta-item">
                              <FontAwesomeIcon icon="calendar-plus"/>
                              <span>{t('common.createdAt', 'Створено')}: {formatDate(material.addedAt)}</span>
                            </div>
                            {material.fileLink && (
                              <div className="meta-item">
                                <FontAwesomeIcon icon="paperclip"/>
                                <span>{t('materials.fields.hasFileLink')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Дії */}
                        <div className="material-row-actions">
                          <Link
                            to={`/materials/${material.materialId}`}
                            className="btn btn-primary btn-view-material"
                          >
                            <FontAwesomeIcon icon="eye"/>
                            {t('materials.actions.view', 'Переглянути')}
                          </Link>
                          
                          {/* Кнопки для власних матеріалів викладача */}
                          {user?.role === 'Tutor' && material.creatorId === user.userId && (
                            <>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleEditMaterial(material)}
                                title={t('materials.actions.edit', 'Редагувати')}
                              >
                                <FontAwesomeIcon icon="edit"/>
                                {t('materials.actions.edit', 'Редагувати')}
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteMaterial(material.materialId)}
                                title={t('materials.actions.delete', 'Видалити')}
                              >
                                <FontAwesomeIcon icon="trash"/>
                                {t('materials.actions.delete', 'Видалити')}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
          onClose={closeCreateModal}
          userRole={user?.role}
        />
      )}

      {/* Модальне вікно редагування матеріалу */}
      {showEditModal && editingMaterial && (
        <EditMaterialModal
          material={editingMaterial}
          onSubmit={handleEditMaterialSubmit}
          onClose={closeEditModal}
          userRole={user?.role}
        />
      )}
    </Layout>
  );
};

export default MaterialsPage;