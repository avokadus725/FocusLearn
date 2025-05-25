import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

  // Закриття модального вікна при кліку на overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="assignment-modal-overlay" onClick={handleOverlayClick}>
      <div className="assignment-modal">
        
        {/* Заголовок модального вікна */}
        <div className="modal-header">
          <h2 className="modal-title">
            <i className="fas fa-tasks"></i>
            {assignment.title}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Статус завдання */}
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

        {/* Контент модального вікна */}
        <div className="modal-content">
          
          {/* Основна інформація */}
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
          </div>

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

        {/* Дії модального вікна */}
        <div className="modal-actions">
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