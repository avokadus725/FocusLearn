import React from 'react';
import { useTranslation } from 'react-i18next';
import './AssignmentsSidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AssignmentsSidebar = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  userRole,
  onCreateAssignment 
}) => {
  const { t } = useTranslation();
  const handleCreateClick = () => {
    console.log('Create button clicked, userRole:', userRole);
    
    if (typeof onCreateAssignment === 'function') {
      onCreateAssignment();
    } else {
      console.error('onCreateAssignment is not a function:', onCreateAssignment);
    }
  };

  return (
    <div className="assignments-sidebar">
      {/* Заголовок бічної панелі */}
      <div className="sidebar-header">
        <h3 className="sidebar-title">
          <i className="fas fa-list"></i>
          {t('assignments.sidebar.title')}
        </h3>
        <div className="sidebar-role">
          <span className={`role-badge role-${userRole?.toLowerCase()}`}>
            {t(`profile.roles.${userRole}`)}
          </span>
        </div>
      </div>

      {/* Навігаційні вкладки */}
      <nav className="sidebar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? 'sidebar-tab-active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="tab-icon">
              <FontAwesomeIcon icon={tab.icon}/>
            </div>
            <div className="tab-content">
              <span className="tab-label">{tab.label}</span>
            </div>
            <div className="tab-arrow">
              <FontAwesomeIcon icon="chevron-right"/>
            </div>
          </button>
        ))}
      </nav>

      {/* Додatkова інформація */}
      <div className="sidebar-info">
        <div className="info-card">
          <div className="info-icon">
            <FontAwesomeIcon icon="info"/>
          </div>
          <div className="info-content">
            <h4 className="info-title">
              {t('assignments.sidebar.help.title')}
            </h4>
            <p className="info-text">
              {userRole === 'Student' 
                ? t('assignments.sidebar.help.studentText')
                : t('assignments.sidebar.help.tutorText')
              }
            </p>
          </div>
        </div>

        {/* Швидкі дії */}
        {userRole === 'Tutor' && (
        <div className="assignments-create-section">          
          <button 
            className="assignments-create-btn"
            onClick={handleCreateClick}
            type="button"
          >
            <i className="fas fa-plus"></i>
            {t('assignments.createNew.button')}
          </button>
        </div>
      )}
      </div>

      {/* Статистика (можна додати пізніше) */}
      {/* <div className="sidebar-stats">
        <div className="stat-item">
          <span className="stat-value">12</span>
          <span className="stat-label">{t('assignments.stats.total')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">3</span>
          <span className="stat-label">{t('assignments.stats.pending')}</span>
        </div>
      </div> */}
    </div>
  );
};

export default AssignmentsSidebar;