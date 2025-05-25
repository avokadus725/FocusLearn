import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import materialService from '../../../api/materialService';
import './AssignmentDetailsModal.css';

const AssignmentDetailsModal = ({ 
  assignment, 
  onAction, 
  onClose, 
  userRole 
}) => {
  const { t } = useTranslation();
  const [fileLink, setFileLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [learningMaterials, setLearningMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  
  // Форма редагування
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    rating: '',
    taskId: ''
  });

  // Ініціалізація форми редагування
  useEffect(() => {
    if (assignment) {
      setEditForm({
        title: assignment.title || '',
        description: assignment.description || '',
        dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '',
        rating: assignment.rating || '',
        taskId: assignment.taskId || ''
      });
    }
  }, [assignment]);

  // Завантаження навчальних матеріалів для редагування
  const loadMaterials = async () => {
    if (!isEditing) return;
    
    try {
      setMaterialsLoading(true);
      const materials = await materialService.getMyMaterials();
      setLearningMaterials(materials);
    } catch (error) {
      console.error('Error loading materials:', error);
      setLearningMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [isEditing]);

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

  // Перевірка чи завдання протерміноване
  const isOverdue = () => {
    if (!assignment.dueDate || assignment.status !== 'InProgress') return false;
    return new Date() > new Date(assignment.dueDate);
  };

  // Перевірка чи можна редагувати завдання
  const canEdit = () => {
    return userRole === 'Tutor' && 
           (assignment.status === 'InProgress' && !assignment.studentId ||
            assignment.status === 'Pending' ||
            assignment.status === 'Completed');
  };

  // Перевірка чи можна редагувати конкретне поле
  const canEditField = (field) => {
    if (!canEdit()) return false;
    
    switch (field) {
      case 'title':
      case 'description':
      case 'taskId':
        // Можна редагувати тільки якщо немає студента (завдання не взято)
        return assignment.status === 'InProgress' && !assignment.studentId;
      case 'dueDate':
        // Можна редагувати дедлайн якщо завдання взято студентом
        return assignment.status === 'InProgress' && assignment.studentId;
      case 'rating':
        // Можна редагувати оцінку в статусі Pending або Completed
        return assignment.status === 'Pending' || assignment.status === 'Completed';
      default:
        return false;
    }
  };

  // Обробка зміни полів форми
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Збереження змін
  const handleSaveEdit = async () => {
    try {
      setIsSubmitting(true);
      
      const updateData = {
        title: editForm.title,
        description: editForm.description,
        taskId: editForm.taskId ? parseInt(editForm.taskId) : assignment.taskId,
        dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : assignment.dueDate,
        rating: editForm.rating ? parseInt(editForm.rating) : assignment.rating,
        // Зберігаємо інші поля без змін
        status: assignment.status,
        studentId: assignment.studentId,
        tutorId: assignment.tutorId,
        fileLink: assignment.fileLink,
        createdAt: assignment.createdAt
      };

      await onAction('update', updateData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating assignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Скасування редагування
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      title: assignment.title || '',
      description: assignment.description || '',
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '',
      rating: assignment.rating || '',
      taskId: assignment.taskId || ''
    });
  };

  // Обробка завантаження файлу
  const handleSubmitFile = async () => {
    if (!fileLink.trim()) {
      alert(t('assignments.errors.fileLinkRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onAction('submit', { fileLink: fileLink.trim() });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обробка завершення завдання
  const handleComplete = async () => {
    const confirmed = window.confirm(t('assignments.confirmations.complete'));
    if (confirmed) {
      await onAction('complete');
    }
  };

  // Обробка оцінювання (для викладача)
  const handleGrade = async () => {
    const rating = prompt(t('assignments.prompts.enterRating'));
    if (rating && rating >= 1 && rating <= 5) {
      await onAction('grade', { rating: parseInt(rating) });
    }
  };

  // Закриття модального вікна при кліку на overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!assignment) return null;

  return (
    <div className="assignment-modal-overlay" onClick={handleOverlayClick}>
      <div className="assignment-modal">
        
        {/* Заголовок модального вікна */}
        <div className="modal-header">
          <h2 className="modal-title">
            <i className="fas fa-tasks"></i>
            {isEditing ? t('assignments.edit.title') : assignment.title}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Статус завдання */}
        {!isEditing && (
          <div className="modal-status">
            <span className={`status-badge status-${assignment.status.toLowerCase()}`}>
              <i className={getStatusIcon(assignment.status)}></i>
              {t(`assignments.statuses.${assignment.status}`)}
            </span>
            {isOverdue() && (
              <span className="overdue-badge">
                <i className="fas fa-exclamation-triangle"></i>
                {t('assignments.overdue')}
              </span>
            )}
          </div>
        )}

        {/* Контент модального вікна */}
        <div className="modal-content">
          
          {isEditing ? (
            // Форма редагування
            <div className="assignment-edit-form">
              <h3 className="section-title">
                <i className="fas fa-edit"></i>
                {t('assignments.edit.editingAssignment')}
              </h3>

              {/* Назва завдання */}
              <div className="form-group">
                <label className="form-label">{t('assignments.fields.title')}:</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                  className="form-input"
                  disabled={!canEditField('title') || isSubmitting}
                  placeholder={t('assignments.placeholders.title')}
                />
              </div>

              {/* Опис завдання */}
              <div className="form-group">
                <label className="form-label">{t('assignments.fields.description')}:</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                  className="form-textarea"
                  disabled={!canEditField('description') || isSubmitting}
                  placeholder={t('assignments.placeholders.description')}
                  rows="4"
                />
              </div>

              {/* Навчальний матеріал */}
              {canEditField('taskId') && (
                <div className="form-group">
                  <label className="form-label">{t('assignments.fields.learningMaterial')}:</label>
                  {materialsLoading ? (
                    <div className="materials-loading">
                      <i className="fas fa-spinner fa-spin"></i>
                      {t('common.loading')}
                    </div>
                  ) : (
                    <select
                      name="taskId"
                      value={editForm.taskId}
                      onChange={handleEditFormChange}
                      className="form-select"
                      disabled={isSubmitting}
                    >
                      <option value="">{t('assignments.form.selectMaterial')}</option>
                      {learningMaterials.map(material => (
                        <option key={material.materialId} value={material.materialId}>
                          {material.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Дедлайн */}
              {canEditField('dueDate') && (
                <div className="form-group">
                  <label className="form-label">{t('assignments.fields.dueDate')}:</label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={editForm.dueDate}
                    onChange={handleEditFormChange}
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Оцінка */}
              {canEditField('rating') && (
                <div className="form-group">
                  <label className="form-label">{t('assignments.fields.rating')}:</label>
                  <select
                    name="rating"
                    value={editForm.rating}
                    onChange={handleEditFormChange}
                    className="form-select"
                    disabled={isSubmitting}
                  >
                    <option value="">{t('assignments.form.selectRating')}</option>
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            // Перегляд деталей
            <div className="assignment-details-section">
              <h3 className="section-title">
                <i className="fas fa-info-circle"></i>
                {t('assignments.details.information')}
              </h3>
              
              {assignment.description && (
                <div className="detail-item">
                  <label className="detail-label">{t('assignments.fields.description')}:</label>
                  <p className="detail-value">{assignment.description}</p>
                </div>
              )}
              
              <div className="detail-item">
                <label className="detail-label">{t('assignments.fields.tutor')}:</label>
                <span className="detail-value">ID: {assignment.tutorId}</span>
              </div>

              {assignment.studentId && (
                <div className="detail-item">
                  <label className="detail-label">{t('assignments.fields.student')}:</label>
                  <span className="detail-value">ID: {assignment.studentId}</span>
                </div>
              )}
              
              {assignment.dueDate && (
                <div className="detail-item">
                  <label className="detail-label">{t('assignments.fields.dueDate')}:</label>
                  <span className={`detail-value ${isOverdue() ? 'text-danger' : ''}`}>
                    {formatDate(assignment.dueDate)}
                  </span>
                </div>
              )}
              
              <div className="detail-item">
                <label className="detail-label">{t('assignments.fields.createdAt')}:</label>
                <span className="detail-value">{formatDate(assignment.createdAt)}</span>
              </div>
              
              {assignment.rating && (
                <div className="detail-item">
                  <label className="detail-label">{t('assignments.fields.rating')}:</label>
                  <div className="rating-display">
                    {Array.from({ length: 5 }, (_, i) => (
                      <i
                        key={i}
                        className={`fas fa-star ${
                          i < assignment.rating ? 'star-filled' : 'star-empty'
                        }`}
                      ></i>
                    ))}
                    <span className="rating-number">({assignment.rating}/5)</span>
                  </div>
                </div>
              )}

              {/* Файл завдання */}
              {assignment.fileLink && (
                <div className="assignment-details-section">
                  <h3 className="section-title">
                    <i className="fas fa-paperclip"></i>
                    {t('assignments.details.submittedFile')}
                  </h3>
                  <div className="file-download">
                    <a 
                      href={assignment.fileLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="file-download-btn"
                    >
                      <i className="fas fa-download"></i>
                      {t('assignments.downloadFile')}
                    </a>
                  </div>
                </div>
              )}

              {/* Завантаження файлу (тільки для InProgress завдань без файлу) */}
              {userRole === 'Student' && 
               assignment.status === 'InProgress' && 
               assignment.studentId && 
               !assignment.fileLink && (
                <div className="assignment-details-section">
                  <h3 className="section-title">
                    <i className="fas fa-upload"></i>
                    {t('assignments.details.submitFile')}
                  </h3>
                  <div className="file-upload-form">
                    <div className="form-group">
                      <label className="form-label">
                        {t('assignments.fields.fileLink')}:
                      </label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder={t('assignments.placeholders.fileLink')}
                        value={fileLink}
                        onChange={(e) => setFileLink(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <button
                      className="btn-submit-file"
                      onClick={handleSubmitFile}
                      disabled={isSubmitting || !fileLink.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          {t('common.submitting')}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-upload"></i>
                          {t('assignments.actions.submitFile')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Дії модального вікна */}
        <div className="modal-actions">
          {isEditing ? (
            // Кнопки редагування
            <>
              <button
                className="btn-close-modal"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                <i className="fas fa-times"></i>
                {t('common.cancel')}
              </button>
              <button
                className="btn-complete-assignment"
                onClick={handleSaveEdit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    {t('common.save')}
                  </>
                )}
              </button>
            </>
          ) : (
            // Кнопки перегляду
            <>
              {/* Кнопка редагування для викладача */}
              {canEdit() && (
                <button
                  className="btn-secondary"
                  onClick={() => setIsEditing(true)}
                  disabled={isSubmitting}
                >
                  <i className="fas fa-edit"></i>
                  {t('assignments.actions.edit')}
                </button>
              )}

              {/* Кнопка оцінювання для викладача */}
              {userRole === 'Tutor' && assignment.status === 'Pending' && (
                <button
                  className="btn-warning"
                  onClick={handleGrade}
                  disabled={isSubmitting}
                >
                  <i className="fas fa-star"></i>
                  {t('assignments.actions.grade')}
                </button>
              )}

              {/* Кнопка завершення для студента */}
              {userRole === 'Student' && (
                assignment.status === 'InProgress' || assignment.status === 'Completed'
              ) && (
                <button
                  className="btn-complete-assignment"
                  onClick={handleComplete}
                  disabled={isSubmitting}
                >
                  <i className="fas fa-check"></i>
                  {assignment.status === 'Completed' 
                    ? t('assignments.actions.markAsComplete')
                    : t('assignments.actions.abandon')
                  }
                </button>
              )}
              
              <button className="btn-close-modal" onClick={onClose}>
                <i className="fas fa-times"></i>
                {t('common.close')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper функція для іконок статусів
const getStatusIcon = (status) => {
  const icons = {
    'InProgress': 'fas fa-play-circle',
    'Pending': 'fas fa-clock',
    'Completed': 'fas fa-check-circle'
  };
  return icons[status] || 'fas fa-question-circle';
};

export default AssignmentDetailsModal;