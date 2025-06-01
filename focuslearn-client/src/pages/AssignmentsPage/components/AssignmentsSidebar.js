// src/pages/AssignmentsPage/components/AssignmentsSidebar.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './AssignmentsSidebar.css';

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
              <FontAwesomeIcon icon={tab.icon} />
            </div>
            <div className="tab-content">
              <span className="tab-label">{tab.label}</span>
            </div>
            <div className="tab-arrow">
              <FontAwesomeIcon icon="chevron-right" />
            </div>
          </button>
        ))}
      </nav>

      { /* Додаткова інформація */ }        
      <div className="sidebar-info">
          <div className="info-card">
            <div className="info-icon">
          <FontAwesomeIcon icon="info" />
            </div>
            <div className="info-content">
          <h4 className="info-title">
            {t('assignments.sidebar.help.title')}
          </h4>
          <p className="info-text">
            {userRole === 'Student'
              ? t('assignments.sidebar.help.studentText')
              : userRole === 'Admin'
            ? t('assignments.sidebar.help.adminText')
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
              <FontAwesomeIcon icon="plus" />
              {t('assignments.createNew.button')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsSidebar;