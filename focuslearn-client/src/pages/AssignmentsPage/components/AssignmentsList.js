import React from 'react';
import { useTranslation } from 'react-i18next';
import './AssignmentsList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AssignmentsList = ({ 
  assignments, 
  onAssignmentAction, 
  loading,
  listType = 'available',
  userRole = 'Student'
}) => {
  const { t } = useTranslation();

  // Отримання заголовків залежно від типу списку
  const getListConfig = () => {
    switch (listType) {
      case 'pending':
        return {
          title: t('assignments.tabs.pendingReview'),
          description: t('assignments.descriptions.pendingReview'),
          icon: 'clock',
          actionButton: { 
            label: t('assignments.actions.grade'), 
            icon: 'star', 
            action: 'grade',
            className: 'btn-grade-assignment'
          }
        };
      case 'admin':
        return {
          title: t('assignments.tabs.allAssignments', 'Усі завдання'),
          description: t('assignments.descriptions.adminAssignments', 'Керуйте всіма завданнями системи'),
          actionButton: { 
            label: t('assignments.actions.delete', 'Видалити'), 
            icon: 'trash', 
            action: 'delete',
            className: 'btn-delete-assignment'
          }
        };
      default:
        return {
          title: t('assignments.tabs.availableAssignments'),
          description: t('assignments.descriptions.availableAssignments'),
          icon: 'search',
          actionButton: { 
            label: t('assignments.actions.take'), 
            action: 'take',
            className: 'btn-take-assignment'
          }
        };
    }
  };

  const config = getListConfig();

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

  // Обробка кнопки дії
  const handleActionButton = (assignmentId) => {
    if (config.actionButton.action === 'grade') {
      const rating = prompt(t('assignments.prompts.enterRating'));
      if (rating && rating >= 1 && rating <= 5) {
        onAssignmentAction('grade', assignmentId, { rating: parseInt(rating) });
      }
    } else if (config.actionButton.action === 'delete') {
      if (window.confirm(t('assignments.confirmations.deleteAssignment', 'Ви впевнені, що хочете видалити це завдання?'))) {
        onAssignmentAction('delete', assignmentId);
      }
    } else {
      onAssignmentAction(config.actionButton.action, assignmentId);
    }
  };

  if (loading) {
    return (
      <div className="available-assignments-loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="available-assignments-list">
      {/* Заголовок */}
      <div className="available-assignments-header">
        <h2 className="list-title">
          <FontAwesomeIcon icon={config.icon}/>
          {config.title}
        </h2>
        <p className="list-description">
          {config.description}
        </p>
        <div className="assignments-count">
          {assignments.length} {t('assignments.assignmentsFound')}
        </div>
      </div>

      {/* Список завдань */}
      <div className="available-assignments-content">
        {assignments.length === 0 ? (
          userRole === 'Student' && (
          <div className="assignments-empty-state">
            <div className="empty-state-icon">
              <FontAwesomeIcon icon="search"/>
            </div>
            <h3 className="empty-state-title">
              {t('assignments.empty.availableAssignments.title')}
            </h3>
            <p className="empty-state-description">
              {t('assignments.empty.availableAssignments.description')}
            </p>
          </div>
          )
        ) : (
          <div className="assignments-rows">
            {assignments.map((assignment) => (
              <div key={assignment.assignmentId} className="assignment-row">
                
                {/* Основна інформація */}
                <div className="assignment-row-main">
                  <div className="assignment-row-info">
                    <h3 className="assignment-row-title">{assignment.title}</h3>
                    {assignment.description && (
                      <p className="assignment-row-description">{assignment.description}</p>
                    )}
                    {listType === 'admin' && (
                      <div className="admin-assignment-details">
                        <span className={`assignment-status status-${assignment.status?.toLowerCase()}`}>
                          {t(`assignments.statuses.${assignment.status?.toLowerCase()}`, assignment.status)}
                        </span>
                        {assignment.studentId && (
                          <span className="assignment-student">
                            {t('profile.roles.Tutor')} {assignment.studentName || `ID: ${assignment.studentId}`}
                          </span>
                        )}
                        {assignment.rating && (
                          <span className="assignment-rating">
                            {t('assignments.fields.rating')}: {assignment.rating}/5
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="assignment-row-meta">
                    <div className="meta-item">
                      <FontAwesomeIcon icon="user"/>
                      <span>
                        {userRole === 'Student' 
                          ? `Викладач: ${assignment.tutorName || `ID: ${assignment.tutorId}`}`
                          : `Студент: ${assignment.studentName || `ID: ${assignment.studentId || 'Не призначено'}`}`
                        }
                      </span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-calendar-plus"></i>
                      <span>{t('common.createdAt')}: {formatDate(assignment.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Кнопка дії */}
                <div className="assignment-row-actions">
                  <button
                    className={config.actionButton.className}
                    onClick={() => handleActionButton(assignment.assignmentId)}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={config.actionButton.icon}/>
                    {config.actionButton.label}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsList;