import React from 'react';
import { useTranslation } from 'react-i18next';
import './AssignmentsSidebar.css';

const AssignmentsSidebar = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  userRole 
}) => {
  const { t } = useTranslation();

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
              <i className={tab.icon}></i>
            </div>
            <div className="tab-content">
              <span className="tab-label">{tab.label}</span>
            </div>
            <div className="tab-arrow">
              <i className="fas fa-chevron-right"></i>
            </div>
          </button>
        ))}
      </nav>

      {/* Додatkова інформація */}
      <div className="sidebar-info">
        <div className="info-card">
          <div className="info-icon">
            <i className="fas fa-info-circle"></i>
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
          <div className="sidebar-actions">
            <button className="sidebar-action-btn">
              <i className="fas fa-plus"></i>
              {t('assignments.sidebar.createNew')}
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