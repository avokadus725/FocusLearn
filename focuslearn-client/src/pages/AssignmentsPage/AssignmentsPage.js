import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/common/Layout';
import assignmentService from '../../api/assignmentService';
import AssignmentsSidebar from './components/AssignmentsSidebar';
import AssignmentsList from './components/AssignmentsList';
import MyAssignmentsTabs from './components/MyAssignmentsTabs';
import AssignmentDetailsModal from './components/AssignmentDetailsModal';
import './AssignmentsPage.css';

const AssignmentsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Стани
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('available');
  const [activeSubTab, setActiveSubTab] = useState('inProgress');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Завантаження завдань
  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Спочатку перевіряємо протерміновані завдання
      //await assignmentService.checkOverdueAssignments();
      
      // Потім завантажуємо всі завдання
      const data = await assignmentService.getMyAssignments();
      setAssignments(data);
      
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError(t('assignments.errors.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Ініціалізація
  useEffect(() => {
    loadAssignments();
  }, []);

  // Встановлення активної вкладки по замовчуванню
  useEffect(() => {
    if (user?.role === 'Student') {
      setActiveTab('available');
    } else if (user?.role === 'Tutor') {
      setActiveTab('my');
    }
  }, [user]);

  // Фільтрація завдань відповідно до активної вкладки
  const getFilteredAssignments = () => {
    if (!assignments.length) return [];

    switch (activeTab) {
      case 'available':
        return assignmentService.filterAssignments.availableAssignments(assignments);
      
      case 'my':
        if (user?.role === 'Student') {
          // Для студентів використовуємо під-вкладки
          switch (activeSubTab) {
            case 'inProgress':
              return assignmentService.filterAssignments.myInProgress(assignments, user.userId);
            case 'pending':
              return assignmentService.filterAssignments.myPending(assignments, user.userId);
            case 'completed':
              return assignmentService.filterAssignments.myCompleted(assignments, user.userId);
            default:
              return [];
          }
        } else {
          // Для викладачів показуємо всі їхні завдання
          return assignmentService.filterAssignments.tutorAssignments(assignments, user.userId);
        }
      
      case 'pending':
        return assignmentService.filterAssignments.tutorPendingAssignments(assignments, user.userId);
      
      default:
        return [];
    }
  };

  // Обробка дій з завданнями
  const handleAssignmentAction = async (action, assignmentId, additionalData = {}) => {
    try {
      setMessage({ type: '', text: '' });
      
      switch (action) {
        case 'take':
          await assignmentService.takeAssignment(assignmentId);
          setMessage({ type: 'success', text: t('assignments.messages.takeSuccess') });
          break;
          
        case 'submit':
          await assignmentService.submitAssignment(assignmentId, additionalData.fileLink);
          setMessage({ type: 'success', text: t('assignments.messages.submitSuccess') });
          break;
          
        case 'complete':
          await assignmentService.completeAssignment(assignmentId);
          setMessage({ type: 'success', text: t('assignments.messages.completeSuccess') });
          break;
          
        case 'grade':
          await assignmentService.gradeAssignment(assignmentId, additionalData.rating);
          setMessage({ type: 'success', text: t('assignments.messages.gradeSuccess') });
          break;
          
        case 'delete':
          await assignmentService.deleteAssignment(assignmentId);
          setMessage({ type: 'success', text: t('assignments.messages.deleteSuccess') });
          break;
          
        case 'details':
          const assignment = assignments.find(a => a.assignmentId === assignmentId);
          setSelectedAssignment(assignment);
          setShowDetailsModal(true);
          return; // Не перезавантажуємо дані для деталей
          
        default:
          throw new Error('Unknown action');
      }
      
      // Перезавантажуємо завдання після дії
      await loadAssignments();
      
      // Очищуємо повідомлення через 3 секунди
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (err) {
      console.error('Error performing assignment action:', err);
      setMessage({ 
        type: 'error', 
        text: t('assignments.errors.actionError') 
      });
    }
  };

  // Закрити модальне вікно деталей
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedAssignment(null);
  };

  // Обробка дій з модального вікна
  const handleModalAction = async (action, additionalData = {}) => {
    await handleAssignmentAction(action, selectedAssignment.assignmentId, additionalData);
    handleCloseDetailsModal();
  };

  // Отримання конфігурації вкладок для поточного користувача
  const getTabsConfig = () => {
    if (user?.role === 'Student') {
      return [
        { id: 'available', label: t('assignments.tabs.availableAssignments'), icon: 'fas fa-search' },
        { id: 'my', label: t('assignments.tabs.myAssignments'), icon: 'fas fa-tasks' }
      ];
    } else if (user?.role === 'Tutor') {
      return [
        { id: 'my', label: t('assignments.tabs.myAssignments'), icon: 'fas fa-tasks' },
        { id: 'pending', label: t('assignments.tabs.pendingReview'), icon: 'fas fa-clock' }
      ];
    }
    return [];
  };

  const filteredAssignments = getFilteredAssignments();

  if (loading) {
    return (
      <Layout>
        <div className="assignments-loading">
          <div className="assignments-loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="assignments-page">
        <div className="assignments-container">
          
          {/* Заголовок сторінки */}
          <div className="assignments-header">
            <h1 className="assignments-title">{t('assignments.title')}</h1>
            <p className="assignments-subtitle">{t('assignments.subtitle')}</p>
          </div>

          {/* Повідомлення */}
          {message.text && (
            <div className={`assignments-alert assignments-alert-${message.type}`}>
              <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
              {message.text}
            </div>
          )}

          {/* Помилка завантаження */}
          {error && (
            <div className="assignments-alert assignments-alert-error">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
              <button 
                className="assignments-retry-btn"
                onClick={loadAssignments}
              >
                {t('common.retry')}
              </button>
            </div>
          )}

          {/* Основний контент */}
          <div className="assignments-content">
            
            {/* Бічна панель з вкладками */}
            <AssignmentsSidebar
              tabs={getTabsConfig()}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              userRole={user?.role}
            />

            {/* Контент залежно від вкладки */}
            <div className="assignments-main-content">
              
              {/* Доступні завдання - для студентів */}
              {activeTab === 'available' && user?.role === 'Student' && (
                <AssignmentsList
                  assignments={filteredAssignments}
                  onAssignmentAction={handleAssignmentAction}
                  loading={loading}
                />
              )}
              
              {/* Мої завдання - для студентів (з під-вкладками) */}
              {activeTab === 'my' && user?.role === 'Student' && (
                <MyAssignmentsTabs
                  assignments={assignments}
                  activeSubTab={activeSubTab}
                  onSubTabChange={setActiveSubTab}
                  onAssignmentAction={handleAssignmentAction}
                  userId={user.userId}
                  loading={loading}
                />
              )}
              
              {/* Мої завдання - для викладачів */}
              {activeTab === 'my' && user?.role === 'Tutor' && (
                <MyAssignmentsTabs
                  assignments={assignments}
                  activeSubTab={activeSubTab}
                  onSubTabChange={setActiveSubTab}
                  onAssignmentAction={handleAssignmentAction}
                  userId={user.userId}
                  loading={loading}
                  userRole="Tutor"
                />
              )}
              
              {/* На перевірці - для викладачів */}
              {activeTab === 'pending' && user?.role === 'Tutor' && (
                <AssignmentsList
                  assignments={filteredAssignments}
                  onAssignmentAction={handleAssignmentAction}
                  loading={loading}
                  listType="pending"
                  userRole="Tutor"
                />
              )}
              
            </div>
          </div>
        </div>
      </div>

      {/* Модальне вікно деталей завдання */}
      {showDetailsModal && selectedAssignment && (
        <AssignmentDetailsModal
          assignment={selectedAssignment}
          onAction={handleModalAction}
          onClose={handleCloseDetailsModal}
          userRole={user?.role}
        />
      )}
    </Layout>
  );
};

export default AssignmentsPage;