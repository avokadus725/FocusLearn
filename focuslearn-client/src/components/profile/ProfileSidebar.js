// src/components/profile/ProfileSidebar.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ProfileSidebar = ({ onDeleteAccount }) => {
  const { t } = useTranslation();
  
  const quickLinks = [
    { to: '/statistics', icon: 'chart-bar', label: t('navigation.statistics') },
    { to: '/methods', icon: 'clock', label: t('navigation.methods') },
    { to: '/assignments', icon: 'tasks', label: t('navigation.assignments') }
  ];
  
  return (
    <div className="space-y-6">
      
      {/* Quick Links */}
      <div className="card">
        <div className="card-header">
          <h3 className="heading-6 flex items-center gap-2 mb-0">
            <FontAwesomeIcon icon="bolt" className="text-primary-700" />
            {t('profile.quickLinks')}
          </h3>
        </div>
        <div className="card-body pt-0">
          <div className="sidebar-links">
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to} className="sidebar-link">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Danger Zone - як окрема картка */}
      <div className="card danger-zone-card">
        <div className="danger-zone-content">
          <div className="danger-zone-header">
            <FontAwesomeIcon icon="exclamation-triangle" className="text-danger-500" />
            <h3>{t('profile.dangerZone')}</h3>
          </div>
          
          <p className="danger-zone-text">
            {t('profile.dangerZoneText')}
          </p>
          
          <button 
            className="btn btn-danger btn-sm w-full"
            onClick={onDeleteAccount}
          >
            <FontAwesomeIcon icon="trash" />
            {t('profile.deleteAccount')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;