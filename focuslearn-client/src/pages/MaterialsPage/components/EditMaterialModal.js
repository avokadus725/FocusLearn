import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import './CreateMaterialModal.css'; 

const EditMaterialModal = ({ material, onSubmit, onClose, userRole }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileLink: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Ініціалізація форми даними матеріалу
  useEffect(() => {
    if (material) {
      setFormData({
        title: material.title || '',
        description: material.description || '',
        fileLink: material.fileLink || ''
      });
    }
  }, [material]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаємо помилку для поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = t('materials.validation.titleRequired');
    } else if (formData.title.length < 3) {
      newErrors.title = t('materials.validation.titleMinLength');
    }
    
    if (!formData.description.trim()) {
      newErrors.description = t('materials.validation.descriptionRequired');
    } else if (formData.description.length < 10) {
      newErrors.description = t('materials.validation.descriptionMinLength');
    }
    
    // Перевірка URL якщо введений
    if (formData.fileLink.trim()) {
      try {
        new URL(formData.fileLink);
      } catch {
        newErrors.fileLink = t('materials.validation.invalidUrl');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Material edit form submitted!');
    
    if (!validateForm()) {
      console.log('Validation failed:', errors);
      return;
    }
    
    setLoading(true);
    
    try {
      const materialData = {
        ...formData,
        materialId: material.materialId,
        creatorId: material.creatorId
      };
      
      console.log('Submitting material update:', materialData);
      await onSubmit(materialData);
      
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Update material button clicked!');
    handleSubmit(e);
  };

  const handleCancelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Cancel button clicked!');
    onClose();
  };

  const getCharacterCount = (text, max) => {
    const count = text.length;
    const className = count > max * 0.9 ? 'error' : count > max * 0.7 ? 'warning' : '';
    return (
      <div className={`character-counter ${className}`}>
        {count}/{max}
      </div>
    );
  };

  return (
    <div className="create-modal-overlay" onClick={onClose}>
      <div className="create-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="create-modal-header">
          <h2 className="create-modal-title">
            {t('materials.edit.title')}
          </h2>
          <button className="create-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="create-modal-body">
          <form onSubmit={handleSubmit} className="create-assignment-form">
            
            {/* Основна інформація */}
            <div className="create-form-section">
              <h3 className="create-form-section-title">
                <i className="fas fa-info-circle"></i>
                {t('materials.form.sections.basicInfo')}
              </h3>
              
              <div className="create-form-group">
                <label htmlFor="title" className="create-form-label required">
                  {t('materials.form.title')}
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`create-form-input ${errors.title ? 'error' : ''}`}
                  placeholder={t('materials.form.titlePlaceholder')}
                  maxLength="100"
                />
                {getCharacterCount(formData.title, 100)}
                {errors.title && (
                  <span className="create-error-message">{errors.title}</span>
                )}
              </div>

              <div className="create-form-group">
                <label htmlFor="description" className="create-form-label required">
                  {t('materials.form.description')}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`create-form-textarea ${errors.description ? 'error' : ''}`}
                  placeholder={t('materials.form.descriptionPlaceholder')}
                  rows="4"
                  maxLength="1000"
                />
                {getCharacterCount(formData.description, 1000)}
                {errors.description && (
                  <span className="create-error-message">{errors.description}</span>
                )}
                <div className="create-form-hint">
                  {t('materials.form.hints.description')}
                </div>
              </div>
            </div>

            {/* Посилання на матеріал */}
            <div className="create-form-section">
              <h3 className="create-form-section-title">
                <i className="fas fa-link"></i>
                {t('materials.form.sections.fileLink')}
              </h3>
              
              <div className="create-form-group">
                <label htmlFor="fileLink" className="create-form-label">
                  {t('materials.form.fileLink')}
                </label>
                <input
                  type="url"
                  id="fileLink"
                  name="fileLink"
                  value={formData.fileLink}
                  onChange={handleInputChange}
                  className={`create-form-input ${errors.fileLink ? 'error' : ''}`}
                  placeholder={t('materials.form.fileLinkPlaceholder')}
                />
                {errors.fileLink && (
                  <span className="create-error-message">{errors.fileLink}</span>
                )}
                <div className="create-form-hint">
                  {t('materials.form.hints.fileLink')}
                </div>
              </div>
            </div>

            {/* Кнопки дій */}
            <div className="create-modal-actions">
              <button
                type="button"
                className="create-btn create-btn-secondary"
                onClick={handleCancelClick}
                disabled={loading}
              >
                <i className="fas fa-times"></i>
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="create-btn create-btn-primary"
                disabled={loading}
                onClick={handleUpdateClick}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner create-loading-spinner"></i>
                    {t('common.updating')}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    {t('materials.edit.submit')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMaterialModal;