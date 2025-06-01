import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import assignmentService from '../../../api/assignmentService';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import './MyAssignmentsTabs.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const MyAssignmentsTabs = ({ 
  assignments = [], // Додано значення за замовчуванням
  activeSubTab, 
  onSubTabChange, 
  onAssignmentAction, 
  userId, 
  loading = false,
  userRole = 'Student' // Гарантовано значення за замовчуванням
}) => {
  const { t } = useTranslation();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    assignmentId: null,
    action: null,
    title: '',
    message: '',
    confirmText: '',
    variant: 'danger'
  });

  // Мемоізуємо конфігурацію під-вкладок з додатковими перевірками
  const subTabs = useMemo(() => {
    // Перевіряємо, що всі необхідні залежності є
    if (!t) {
      console.warn('Translation function not available');
      return [];
    }

    try {
      if (userRole === 'Student') {
        return [
          {
            id: 'inProgress',
            label: t('assignments.subTabs.inProgress'),
            icon: 'play-circle',
            filter: assignmentService.filterAssignments.myInProgress
          },
          {
            id: 'pending',
            label: t('assignments.subTabs.pending'),
            icon: 'clock',
            filter: assignmentService.filterAssignments.myPending
          },
          {
            id: 'completed',
            label: t('assignments.subTabs.completed'),
            icon: 'check-circle',
            filter: assignmentService.filterAssignments.myCompleted
          }
        ];
      } else {
        // Для викладачів
        return [
          {
            id: 'all',
            label: t('assignments.subTabs.allMy'),
            icon: 'tasks',
            filter: assignmentService.filterAssignments.tutorAssignments
          },
          {
            id: 'active',
            label: t('assignments.subTabs.active'),
            icon: 'play-circle',
            filter: (assignments, userId) => assignments.filter(a => 
              a.tutorId === userId && 
              a.status === 'InProgress'
            )
          },
          {
            id: 'graded',
            label: t('assignments.subTabs.graded'),
            icon: 'star',
            filter: (assignments, userId) => assignments.filter(a => 
              a.tutorId === userId && 
              a.status === 'Completed'
            )
          }
        ];
      }
    } catch (error) {
      console.error('Error creating subTabs config:', error);
      return [];
    }
  }, [userRole, t]);

  // Отримання завдань для активної під-вкладки з додатковими перевірками
  const getFilteredAssignments = () => {
    if (!assignments || !Array.isArray(assignments)) {
      return [];
    }

    const activeTabConfig = subTabs.find(tab => tab.id === activeSubTab);
    if (activeTabConfig && activeTabConfig.filter) {
      try {
        return activeTabConfig.filter(assignments, userId) || [];
      } catch (error) {
        console.error('Error filtering assignments:', error);
        return [];
      }
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

  // Функція для показу модального вікна підтвердження
  const showConfirmation = (assignmentId, action, assignment) => {
    let title, message, confirmText, variant;

    switch (action) {
      case 'delete':
        title = t('assignments.confirmations.delete.title');
        message = t('assignments.confirmations.delete.message', { title: assignment?.title });
        confirmText = t('assignments.confirmations.delete.confirm');
        variant = 'danger';
        break;
      case 'complete':
        title = t('assignments.confirmations.complete.title');
        message = t('assignments.confirmations.complete.message');
        confirmText = t('assignments.confirmations.complete.confirm');
        variant = 'warning';
        break;
      case 'grade':
        // Для оцінювання відкриваємо промпт замість модального вікна
        const rating = prompt(t('assignments.prompts.enterRating'));
        if (rating && rating >= 1 && rating <= 5) {
          onAssignmentAction('grade', assignmentId, { rating: parseInt(rating) });
        }
        return;
      default:
        return;
    }

    setConfirmModal({
      isOpen: true,
      assignmentId,
      action,
      title,
      message,
      confirmText,
      variant
    });
  };

  // Підтвердження дії
  const handleConfirmAction = async () => {
    const { assignmentId, action } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    await onAssignmentAction(action, assignmentId);
  };

  // Скасування дії
  const handleCancelAction = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Обробка дій
  const handleAction = (action, assignmentId, additionalData = {}) => {
    const assignment = assignments.find(a => a.assignmentId === assignmentId);
    
    // Для небезпечних дій показуємо підтвердження
    if (['delete', 'complete'].includes(action)) {
      showConfirmation(assignmentId, action, assignment);
    } else if (action === 'grade') {
      showConfirmation(assignmentId, action, assignment);
    } else {
      // Для безпечних дій виконуємо відразу
      onAssignmentAction(action, assignmentId, additionalData);
    }
  };

  // Функція для визначення кількості кнопок та застосування відповідного класу
  const getActionButtonsClass = (buttonsCount) => {
    return buttonsCount === 3 ? 'assignment-actions three-buttons' : 'assignment-actions';
  };

  const filteredAssignments = getFilteredAssignments();

  // Якщо немає конфігурації вкладок, показуємо помилку
  if (!subTabs || subTabs.length === 0) {
    return (
      <div className="my-assignments-tabs">
        <div className="assignments-empty-state">
          <div className="empty-state-icon">
            <FontAwesomeIcon icon="exclamation-triangle"/>
          </div>
          <h3 className="empty-state-title">Configuration Error</h3>
          <p className="empty-state-description">Unable to load tab configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-assignments-tabs">
      {/* Заголовок */}
      <div className="my-assignments-header">
        <h2 className="list-title">
          <i className="fas fa-tasks"></i>
          {t('assignments.tabs.myAssignments')}
        </h2>
        <p className="list-description">
          {userRole === 'Student' 
            ? t('assignments.descriptions.myAssignmentsStudent')
            : t('assignments.descriptions.myAssignmentsTutor')
          }
        </p>
      </div>

      {/* Під-вкладки */}
      <div className="sub-tabs-nav">
        {subTabs.map((tab) => {
          let tabAssignments = [];
          try {
            tabAssignments = tab.filter(assignments, userId) || [];
          } catch (error) {
            console.error('Error filtering tab assignments:', error);
          }
          
          return (
            <button
              key={tab.id}
              className={`sub-tab ${activeSubTab === tab.id ? 'sub-tab-active' : ''}`}
              onClick={() => onSubTabChange(tab.id)}
            >
              <FontAwesomeIcon icon={tab.icon}/>
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
            <h3 className="empty-state-title">
              {t(`assignments.empty.${activeSubTab}.title`)}
            </h3>
            <p className="empty-state-description">
              {t(`assignments.empty.${activeSubTab}.description`)}
            </p>
          </div>
        ) : (
          <div className="assignments-cards">
            {filteredAssignments.map((assignment) => {
              // Визначаємо кнопки для кожного завдання
              let buttons = [];
              
              if (userRole === 'Student') {
                // Дії для студентів
                if (activeSubTab === 'inProgress') {
                  buttons = [
                    { 
                      action: 'details', 
                      label: t('assignments.actions.details'), 
                      icon: 'info-circle', 
                      className: 'btn-secondary' 
                    },
                    { 
                      action: 'complete', 
                      label: t('assignments.actions.abandon'), 
                      icon: 'times', 
                      className: 'btn-danger' 
                    }
                  ];
                } else if (activeSubTab === 'pending') {
                  buttons = [
                    { 
                      action: 'details', 
                      label: t('assignments.actions.details'), 
                      icon: 'info-circle', 
                      className: 'btn-secondary' 
                    }
                  ];
                } else if (activeSubTab === 'completed') {
                  buttons = [
                    { 
                      action: 'details', 
                      label: t('assignments.actions.details'), 
                      icon: 'info-circle', 
                      className: 'btn-secondary' 
                    },
                    { 
                      action: 'complete', 
                      label: t('assignments.actions.complete'), 
                      icon: 'check', 
                      className: 'btn-primary' 
                    }
                  ];
                }
              } else {
                // Дії для викладачів
                buttons = [
                  { 
                    action: 'details', 
                    label: t('assignments.actions.details'), 
                    icon: 'info-circle', 
                    className: 'btn-secondary' 
                  }
                ];

                if (assignment.status === 'Pending' && assignment.studentId) {
                  buttons.unshift({
                    action: 'grade', 
                    label: t('assignments.actions.grade'), 
                    icon: 'star', 
                    className: 'btn-warning' 
                  });
                }

                if (assignment.status === 'InProgress' && !assignment.studentId) {
                  buttons.push({
                    action: 'delete', 
                    label: t('assignments.actions.delete'), 
                    icon: 'trash', 
                    className: 'btn-danger' 
                  });
                }
              }

              return (
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
                        <span>{t('assignments.fields.dueDate')}: {formatDate(assignment.dueDate)}</span>
                      </div>
                    )}
                    
                    {assignment.rating && (
                      <div className="info-item">
                        <i className="fas fa-star"></i>
                        <span>{t('assignments.fields.rating')}: {assignment.rating}/5</span>
                      </div>
                    )}
                    
                    {assignment.fileLink && (
                      <div className="info-item">
                        <i className="fas fa-paperclip"></i>
                        <span>{t('assignments.fileAttached')}</span>
                      </div>
                    )}

                    <div className="info-item">
                      <i className="fas fa-calendar-plus"></i>
                      <span>{t('common.createdAt')}: {formatDate(assignment.createdAt)}</span>
                    </div>
                  </div>

                  {/* Дії */}
                  <div className={getActionButtonsClass(buttons.length)}>
                    {buttons.map((button, index) => (
                      <button
                        key={index}
                        className={button.className}
                        onClick={() => handleAction(button.action, assignment.assignmentId)}
                        title={button.label}
                      >
                        <FontAwesomeIcon icob={button.icon}/>
                        <span>{button.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
      />
    </div>
  );
};

// Helper функція для іконок статусів
const getStatusIcon = (status) => {
  const icons = {
    'InProgress': 'play-circle',
    'Pending': 'clock',
    'Completed': 'check-circle'
  };
  return icons[status] || 'question-circle';
};

export default MyAssignmentsTabs;