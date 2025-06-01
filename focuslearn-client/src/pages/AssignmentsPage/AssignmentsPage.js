// src/pages/AssignmentsPage/AssignmentsPage.js
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Layout from '../../components/common/Layout';
import { useAssignments } from '../../hooks/useAssignments';
import AssignmentsSidebar from './components/AssignmentsSidebar';
import AssignmentsList from './components/AssignmentsList';
import MyAssignmentsTabs from './components/MyAssignmentsTabs';
import AssignmentDetailsModal from './components/AssignmentDetailsModal';
import CreateAssignmentModal from './components/CreateAssignmentModal';
import './AssignmentsPage.css';

const AssignmentsPage = () => {
  const { t } = useTranslation();
  
  const {
    // Стани
    loading,
    error,
    message,
    activeTab,
    activeSubTab,
    
    // Дані
    filteredAssignments,
    myAssignments,
    
    // Модальні вікна
    selectedAssignment,
    showDetailsModal,
    showCreateModal,
    
    // Дії
    handleAssignmentAction,
    handleCreateAssignment,
    handleTabChange,
    handleSubTabChange,
    openCreateModal,
    closeCreateModal,
    closeDetailsModal,
    handleModalAction,
    retryLoading,
    
    // Конфігурація
    tabsConfig,
    
    // Користувач
    user
  } = useAssignments();

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
              <FontAwesomeIcon icon={message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}/>
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
                onClick={retryLoading}
              >
                {t('common.retry')}
              </button>
            </div>
          )}

          {/* Основний контент */}
          <div className="assignments-content">
            
            {/* Бічна панель з вкладками */}
            <AssignmentsSidebar
              tabs={tabsConfig}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              userRole={user?.role}
              onCreateAssignment={openCreateModal}
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
                  onSubTabChange={handleSubTabChange}
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
                  onSubTabChange={handleSubTabChange}
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
          onClose={closeDetailsModal}
          userRole={user?.role}
        />
      )}

      {/* Модальне вікно створення завдання */}
      {showCreateModal && (
        <CreateAssignmentModal
          onSubmit={handleCreateAssignment}
          onClose={closeCreateModal}
          userRole={user?.role}
        />
      )}
    </Layout>
  );
};

export default AssignmentsPage;