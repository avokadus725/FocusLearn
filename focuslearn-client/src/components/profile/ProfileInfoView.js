// src/components/profile/ProfileInfoView.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ProfileInfoView = ({ user, onEdit }) => {
  const { t } = useTranslation();
  
  const fields = [
    {
      label: t('profile.fields.userName'),
      value: user?.userName || '-'
    },
    {
      label: t('profile.fields.email'),
      value: user?.email
    },
    {
      label: t('profile.fields.role'),
      value: t(`profile.roles.${user?.role}`) || user?.role
    },
    {
      label: t('profile.fields.language'),
      value: t(`profile.languages.${user?.language}`) || user?.language
    },
    {
      label: t('profile.fields.status'),
      value: t(`profile.statuses.${user?.profileStatus}`) || user?.profileStatus
    }
  ];
  
  return (
    <>
      <div className="card-body">
        <h3 className="heading-4 mb-6 flex items-center gap-2">
          {t('profile.personalInfo')}
        </h3>
        
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={index} className="profile-field">
              <span className="profile-field-label">{field.label}</span>
              <span className="profile-field-value">{field.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-footer">
        <button 
          className="btn btn-primary"
          onClick={onEdit}
        >
          <FontAwesomeIcon icon="edit" />
          {t('profile.editProfile')}
        </button>
      </div>
    </>
  );
};

export default ProfileInfoView;