import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/common/Layout';
import assignmentService from '../../api/assignmentService';
import AssignmentsSidebar from './components/AssignmentsSidebar';
import AssignmentsList from './components/AssignmentsList';
import MyAssignmentsTabs from './components/MyAssignmentsTabs';
import AssignmentDetailsModal from './components/AssignmentDetailsModal';
import CreateAssignmentModal from './components/CreateAssignmentModal';
import './AssignmentsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AssignmentsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Стани
  const [allAssignments, setAllAssignments] = useState([]); 
  const [myAssignments, setMyAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('available');
  const [activeSubTab, setActiveSubTab] = useState('inProgress');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Завантаження завдань
  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (user?.role === 'Admin') {
        const [adminData, myData] = await Promise.all([
          assignmentService.getAllAssignmentsForAdmin(),
          assignmentService.getMyAssignments()
        ]);
        
        setAllAssignments(adminData);
        setMyAssignments(adminData); 
        
      } else {
        const [allData, myData] = await Promise.all([
          assignmentService.getAllAssignments(),
          assignmentService.getMyAssignments()
        ]);
        
        setAllAssignments(allData);
        setMyAssignments(myData);
      }
      
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
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === 'Student') {
      setActiveTab('available');
    } else if (user?.role === 'Tutor') {
      setActiveTab('my');
    } else if (user?.role === 'Admin') {
      setActiveTab('all');
    }
  }, [user]);

  // Фільтрація завдань відповідно до активної вкладки
  const getFilteredAssignments = () => {
    switch (activeTab) {
      case 'available':
        const availableAssignments = assignmentService.filterAssignments.availableAssignments(allAssignments);
        console.log('Available assignments:', availableAssignments);
        return availableAssignments;
      
      case 'my':
        if (user?.role === 'Student') {
          switch (activeSubTab) {
            case 'inProgress':
              return assignmentService.filterAssignments.myInProgress(myAssignments, user.userId);
            case 'pending':
              return assignmentService.filterAssignments.myPending(myAssignments, user.userId);
            case 'completed':
              return assignmentService.filterAssignments.myCompleted(myAssignments, user.userId);
            default:
              return [];
          }
        } else {
          if (user?.role === 'Admin') {
            return myAssignments;
          } else {
            return assignmentService.filterAssignments.tutorAssignments(allAssignments, user.userId);
          }
        }
      
      case 'pending':
        return assignmentService.filterAssignments.tutorPendingAssignments(myAssignments, user.userId);
      
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

        case 'update':
          await assignmentService.updateAssignment(assignmentId, additionalData);
          setMessage({ type: 'success', text: t('assignments.messages.updateSuccess') });
          break;
          
        case 'details':
          let assignment = allAssignments.find(a => a.assignmentId === assignmentId) ||
                          myAssignments.find(a => a.assignmentId === assignmentId);
          setSelectedAssignment(assignment);
          setShowDetailsModal(true);
          return; 
          
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

  const handleCreateAssignment = () => {
    if (user?.role !== 'Tutor' && user?.role !== 'Admin') {
      setMessage({ 
        type: 'error', 
        text: t('assignments.errors.onlyTutorsCanCreate') 
      });
      return;
    }
    setShowCreateModal(true);
  };

  // Створення нового завдання
  const handleCreateAssignmentSubmit = async (assignmentData) => {
    try {
      setMessage({ type: '', text: '' });
      
      console.log('Creating assignment with data:', assignmentData);
      
      await assignmentService.createAssignment(assignmentData);
      
      setMessage({ 
        type: 'success', 
        text: t('assignments.messages.createSuccess') 
      });
      
      // Закрити модальне вікно
      setShowCreateModal(false);
      
      // Перезавантажити завдання
      await loadAssignments();
      
      // Очистити повідомлення через 3 секунди
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (err) {
      console.error('Error creating assignment:', err);
      setMessage({ 
        type: 'error', 
        text: t('assignments.errors.createError') 
      });
    }
  };

  // Закрити модальне вікно створення
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
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
    } else if (user?.role === 'Admin') {
      return [
        { id: 'my', label: t('assignments.tabs.allAssignments', 'Усі завдання'), icon: 'list' }
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
              <FontAwesomeIcon icon={`${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}/>
              {message.text}
            </div>
          )}

          {/* Помилка завантаження */}
          {error && (
            <div className="assignments-alert assignments-alert-error">
              <FontAwesomeIcon icon="exclamation-triangle"/>
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
              onCreateAssignment={handleCreateAssignment}
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
              
              {/* Мої завдання - для студентів */}
              {activeTab === 'my' && user?.role === 'Student' && (
                <MyAssignmentsTabs
                  assignments={myAssignments}
                  activeSubTab={activeSubTab}
                  onSubTabChange={setActiveSubTab}
                  onAssignmentAction={handleAssignmentAction}
                  userId={user.userId}
                  loading={loading}
                  userRole="Student"
                />
              )}
              
              {/* Мої завдання - для викладачів */}
              {activeTab === 'my' && user?.role === 'Tutor' && (
                <MyAssignmentsTabs
                  assignments={myAssignments}
                  activeSubTab={activeSubTab}
                  onSubTabChange={setActiveSubTab}
                  onAssignmentAction={handleAssignmentAction}
                  userId={user.userId}
                  loading={loading}
                  userRole="Tutor"
                />
              )}

              {/* Мої завдання - для адміністраторів */}
              {activeTab === 'my' && user?.role === 'Admin' && (
                <div className="admin-all-assignments">
                  <AssignmentsList
                    assignments={myAssignments}
                    onAssignmentAction={handleAssignmentAction}
                    loading={loading}
                    listType="admin"
                    userRole="Admin"
                  />
                </div>
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

      {/* Модальне вікно створення завдання */}
      {showCreateModal && (
        <CreateAssignmentModal
          onSubmit={handleCreateAssignmentSubmit}
          onClose={handleCloseCreateModal}
          userRole={user?.role}
        />
      )}
    </Layout>
  );
};

export default AssignmentsPage;