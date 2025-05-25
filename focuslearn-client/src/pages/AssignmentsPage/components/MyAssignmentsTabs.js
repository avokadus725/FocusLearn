import React from 'react';
import { useTranslation } from 'react-i18next';
import assignmentService from '../../../api/assignmentService';
import './MyAssignmentsTabs.css';

const MyAssignmentsTabs = ({ 
  assignments, 
  activeSubTab, 
  onSubTabChange, 
  onAssignmentAction, 
  userId, 
  loading,
  userRole = 'Student'
}) => {
  const { t } = useTranslation();

  // Конфігурація під-вкладок залежно від ролі
  const getSubTabs = () => {
    if (userRole === 'Student') {
      return [
        {
          id: 'inProgress',
          label: t('assignments.subTabs.inProgress'),
          //icon: 'fas fa-play-circle',
          filter: assignmentService.filterAssignments.myInProgress
        },
        {
          id: 'pending',
          label: t('assignments.subTabs.pending'),
          //icon: 'fas fa-clock',
          filter: assignmentService.filterAssignments.myPending
        },
        {
          id: 'completed',
          label: t('assignments.subTabs.completed'),
          //icon: 'fas fa-check-circle',
          filter: assignmentService.filterAssignments.myCompleted
        }
      ];
    } else {
      // Для викладачів
      return [
        {
          id: 'all',
          label: t('assignments.subTabs.allMy'),
          icon: 'fas fa-tasks',
          filter: assignmentService.filterAssignments.tutorAssignments
        },
        {
          id: 'active',
          label: t('assignments.subTabs.active'),
          icon: 'fas fa-play-circle',
          filter: (assignments, userId) => assignments.filter(a => 
            a.tutorId === userId && 
            a.status === 'InProgress'
          )
        },
        {
          id: 'graded',
          label: t('assignments.subTabs.graded'),
          icon: 'fas fa-star',
          filter: (assignments, userId) => assignments.filter(a => 
            a.tutorId === userId && 
            a.status === 'Completed'
          )
        }
      ];
    }
  };

  const subTabs = getSubTabs();

  // Отримання завдань для активної під-вкладки
  const getFilteredAssignments = () => {
    const activeTabConfig = subTabs.find(tab => tab.id === activeSubTab);
    if (activeTabConfig) {
      return activeTabConfig.filter(assignments, userId);
    }
    return [];
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

  // Перевірка чи завдання протерміноване
  const isOverdue = (assignment) => {
    if (!assignment.dueDate || assignment.status !== 'InProgress') return false;
    return new Date() > new Date(assignment.dueDate);
  };

  // Обробка дій
  const handleAction = (action, assignmentId, additionalData = {}) => {
    onAssignmentAction(action, assignmentId, additionalData);
  };

  const filteredAssignments = getFilteredAssignments();

  return (
    <div className="my-assignments-tabs">
      {/* Заголовок */}
      <div className="my-assignments-header">
        <h2 className="list-title">
          <i className="fas fa-tasks"></i>
          {t('assignments.tabs.myAssignments')}
        </h2>
        <p className="list-description">
          {t('assignments.descriptions.myAssignmentsStudent')}
        </p>
      </div>

      {/* Під-вкладки */}
      <div className="sub-tabs-nav">
        {subTabs.map((tab) => {
          const tabAssignments = tab.filter(assignments, userId);
          return (
            <button
              key={tab.id}
              className={`sub-tab ${activeSubTab === tab.id ? 'sub-tab-active' : ''}`}
              onClick={() => onSubTabChange(tab.id)}
            >
              <i className={tab.icon}></i>
              <span className="sub-tab-label">{tab.label}</span>
              <span className="sub-tab-count">({tabAssignments.length})</span>
            </button>
          );
        })}
      </div>

      {/* Контент під-вкладки */}
      <div className="sub-tab-content">
        {loading ? (
          <div className="assignments-loading">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="assignments-empty-state">
            <div className="empty-state-icon">
              <i className={subTabs.find(tab => tab.id === activeSubTab)?.icon}></i>
            </div>
            <h3 className="empty-state-title">
              {t(`assignments.empty.${activeSubTab}.title`)}
            </h3>
            <p className="empty-state-description">
              {t(`assignments.empty.${activeSubTab}.description`)}
            </p>
          </div>
        ) : (
          <div className="assignments-cards">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.assignmentId} className="assignment-card">
                
                {/* Заголовок картки */}
                <div className="assignment-card-header">
                  <h3 className="assignment-title">{assignment.title}</h3>
                  <div className="assignment-status">
                    <span className={`status-badge status-${assignment.status.toLowerCase()}`}>
                      <i className={getStatusIcon(assignment.status)}></i>
                      {t(`assignments.statuses.${assignment.status}`)}
                    </span>
                    {isOverdue(assignment) && (
                      <span className="overdue-badge">
                        <i className="fas fa-exclamation-triangle"></i>
                        {t('assignments.overdue')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Опис */}
                {assignment.description && (
                  <div className="assignment-description">
                    <p>{assignment.description}</p>
                  </div>
                )}

                {/* Інформація */}
                <div className="assignment-info">
                  {assignment.dueDate && (
                    <div className="info-item">
                      <i className="fas fa-calendar"></i>
                      <span>Термін: {formatDate(assignment.dueDate)}</span>
                    </div>
                  )}
                  
                  {assignment.rating && (
                    <div className="info-item">
                      <i className="fas fa-star"></i>
                      <span>Оцінка: {assignment.rating}/5</span>
                    </div>
                  )}
                  
                  {assignment.fileLink && (
                    <div className="info-item">
                      <i className="fas fa-paperclip"></i>
                      <span>Файл завантажено</span>
                    </div>
                  )}
                </div>

                {/* Дії */}
                <div className="assignment-actions">
                  {userRole === 'Student' ? (
                    // Дії для студентів
                    <>
                      {activeSubTab === 'inProgress' && (
                        <>
                          <button
                            className="btn-secondary"
                            onClick={() => handleAction('details', assignment.assignmentId)}
                          >
                            <i className="fas fa-info-circle"></i>
                            {t('assignments.actions.details')}
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleAction('complete', assignment.assignmentId)}
                          >
                            <i className="fas fa-times"></i>
                            {t('assignments.actions.abandon')}
                          </button>
                        </>
                      )}
                      
                      {activeSubTab === 'pending' && (
                        <button
                          className="btn-secondary"
                          onClick={() => handleAction('details', assignment.assignmentId)}
                        >
                          <i className="fas fa-info-circle"></i>
                          {t('assignments.actions.details')}
                        </button>
                      )}
                      
                      {activeSubTab === 'completed' && (
                        <button
                          className="btn-primary"
                          onClick={() => handleAction('complete', assignment.assignmentId)}
                        >
                          <i className="fas fa-check"></i>
                          {t('assignments.actions.complete')}
                        </button>
                      )}
                    </>
                  ) : (
                    // Дії для викладачів
                    <>
                      {assignment.status === 'Pending' && assignment.studentId && (
                        <button
                          className="btn-warning"
                          onClick={() => handleAction('grade', assignment.assignmentId)}
                        >
                          <i className="fas fa-star"></i>
                          {t('assignments.actions.grade')}
                        </button>
                      )}
                      
                      <button
                        className="btn-secondary"
                        onClick={() => handleAction('details', assignment.assignmentId)}
                      >
                        <i className="fas fa-edit"></i>
                        {t('assignments.actions.edit')}
                      </button>
                      
                      <button
                        className="btn-danger"
                        onClick={() => handleAction('delete', assignment.assignmentId)}
                      >
                        <i className="fas fa-trash"></i>
                        {t('assignments.actions.delete')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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

export default MyAssignmentsTabs;