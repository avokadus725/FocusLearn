import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import materialService from '../../../api/materialService';
import './CreateAssignmentModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CreateAssignmentModal = ({ onSubmit, onClose, userRole }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    difficulty: 'Medium',
    maxRating: 5,
    deadline: '',
    taskId: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [learningMaterials, setLearningMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);

  // Завантаження навчальних матеріалів користувача
  useEffect(() => {
    loadUserMaterials();
  }, []);

  const loadUserMaterials = async () => {
    try {
      setMaterialsLoading(true);
      console.log('Loading materials for user:', user?.userId);
      
      const materials = await materialService.getMyMaterials();
      console.log('Loaded materials:', materials);
      
      setLearningMaterials(materials);
    } catch (error) {
      console.error('Error loading learning materials:', error);
      if (error.response?.status === 404) {
        console.log('No materials found for user - this is normal');
        setLearningMaterials([]);
      } else {
        setLearningMaterials([]);
      }
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
      newErrors.title = t('assignments.validation.titleRequired');
    } else if (formData.title.length < 3) {
      newErrors.title = t('assignments.validation.titleMinLength');
    }
    
    if (!formData.description.trim()) {
      newErrors.description = t('assignments.validation.descriptionRequired');
    } else if (formData.description.length < 10) {
      newErrors.description = t('assignments.validation.descriptionMinLength');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!'); // Додано для дебагу
    
    if (!validateForm()) {
      console.log('Validation failed:', errors);
      return;
    }
    
    setLoading(true);
    
    try {
      const assignmentData = {
        ...formData,
        taskId: formData.taskId ? parseInt(formData.taskId) : null,
        status: 'InProgress',
        studentId: null,
        fileLink: null,
        rating: null,
        createdAt: new Date().toISOString(),
        deadline: null
      };
      
      console.log('Submitting assignment data:', assignmentData);
      await onSubmit(assignmentData);
      
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setLoading(false);
    }
  };

  // Обробка кліку на кнопку створення
  const handleCreateClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Create button clicked!'); // Додано для дебагу
    handleSubmit(e);
  };

  // Обробка кліку на кнопку скасування
  const handleCancelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Cancel button clicked!'); // Додано для дебагу
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

  const getSelectedMaterialInfo = () => {
    if (!formData.taskId) return null;
    
    const selectedMaterial = learningMaterials.find(m => m.materialId === parseInt(formData.taskId));
    if (!selectedMaterial) return null;
    
    return (
      <div className="selected-material-info">
        <div className="material-preview">
          <FontAwesomeIcon icon="file-alt"/>
          <div className="material-details">
            <strong>{selectedMaterial.title}</strong>
            {selectedMaterial.description && (
              <p>{selectedMaterial.description}</p>
            )}
            {selectedMaterial.fileLink && (
              <a 
                href={selectedMaterial.fileLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="material-link"
              >
                <FontAwesomeIcon icon="external-link-alt"/>
                {t('assignments.form.viewMaterial')}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="create-modal-overlay" onClick={onClose}>
      <div className="create-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="create-modal-header">
          <h2 className="create-modal-title">
            {t('assignments.createNew.title')}
          </h2>
          <button className="create-modal-close" onClick={onClose}>
            <FontAwesomeIcon icon="times"/>
          </button>
        </div>
        
        <div className="create-modal-body">
          <form onSubmit={handleSubmit} className="create-assignment-form">
            
            {/* Основна інформація */}
            <div className="create-form-section">
              <h3 className="create-form-section-title">
                <FontAwesomeIcon icon="info-circle"/>
                {t('assignments.form.sections.basicInfo')}
              </h3>
              
              <div className="create-form-group">
                <label htmlFor="title" className="create-form-label required">
                  {t('assignments.form.title')}
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`create-form-input ${errors.title ? 'error' : ''}`}
                  placeholder={t('assignments.form.titlePlaceholder')}
                  maxLength="100"
                />
                {getCharacterCount(formData.title, 100)}
                {errors.title && (
                  <span className="create-error-message">{errors.title}</span>
                )}
              </div>


              <div className="create-form-group">
                <label htmlFor="description" className="create-form-label required">
                  {t('assignments.form.description')}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`create-form-textarea ${errors.description ? 'error' : ''}`}
                  placeholder={t('assignments.form.descriptionPlaceholder')}
                  rows="4"
                  maxLength="1000"
                />
                {getCharacterCount(formData.description, 1000)}
                {errors.description && (
                  <span className="create-error-message">{errors.description}</span>
                )}
                <div className="create-form-hint">
                  {t('assignments.form.hints.description')}
                </div>
              </div>
            </div>

            {/* Навчальний матеріал */}
            <div className="create-form-section">
              <h3 className="create-form-section-title">
                <FontAwesomeIcon icon="book"/>
                {t('assignments.form.sections.material')}
              </h3>
              
              <div className="create-form-group">                
                {materialsLoading ? (
                  <div className="materials-loading">
                    <FontAwesomeIcon icon="spinner"/>
                    {t('common.loading')}
                  </div>
                ) : (
                  <select
                    id="taskId"
                    name="taskId"
                    value={formData.taskId}
                    onChange={handleInputChange}
                    className={`create-form-select ${errors.taskId ? 'error' : ''}`}
                  >
                    <option value="">
                      {t('assignments.form.selectMaterial')}
                    </option>
                    {learningMaterials.map(material => (
                      <option key={material.materialId} value={material.materialId}>
                        {material.title}
                      </option>
                    ))}
                  </select>
                )}
                
                {errors.taskId && (
                  <span className="create-error-message">{errors.taskId}</span>
                )}
                
                {learningMaterials.length === 0 && !materialsLoading && (
                  <div className="no-materials-message">
                    {t('assignments.form.noMaterials')}
                  </div>
                )}
                
                <div className="create-form-hint">
                  {t('assignments.form.hints.material')}
                </div>
                
                {getSelectedMaterialInfo()}
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
                <FontAwesomeIcon icon="times"/>
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="create-btn create-btn-primary"
                disabled={loading}
                onClick={handleCreateClick}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon="spinner create-loading-spinner"/>
                    {t('common.creating')}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon="plus"/>
                    {t('assignments.createNew.submit')}
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

export default CreateAssignmentModal;