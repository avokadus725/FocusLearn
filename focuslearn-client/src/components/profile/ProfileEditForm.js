// src/components/profile/ProfileEditForm.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ProfileEditForm = ({ 
  editForm, 
  availableLanguages, 
  onInputChange, 
  onSave, 
  onCancel 
}) => {
  const { t } = useTranslation();
  
  return (
    <>
      <div className="card-body">
        <h3 className="heading-4 mb-6 flex items-center gap-2">
          <FontAwesomeIcon icon="edit" className="text-primary-500" />
          {t('profile.editProfile')}
        </h3>
        
        <div className="space-y-6">
          <div className="form-group">
            <label className="form-label">
              {t('profile.fields.userName')}
            </label>
            <input
              type="text"
              name="userName"
              value={editForm.userName}
              onChange={onInputChange}
              className="form-input"
              placeholder={t('profile.placeholders.userName')}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              {t('profile.fields.profilePhoto')}
            </label>
            <input
              type="url"
              name="profilePhoto"
              value={editForm.profilePhoto}
              onChange={onInputChange}
              className="form-input"
              placeholder={t('profile.placeholders.profilePhoto')}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              {t('profile.fields.language')}
            </label>
            <select
              name="language"
              value={editForm.language}
              onChange={onInputChange}
              className="form-select"
            >
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card-footer flex gap-3">
        <button 
          className="btn btn-primary"
          onClick={onSave}
        >
          <FontAwesomeIcon icon="save"/>
          {t('profile.actions.updateProfile')}
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={onCancel}
        >
          <FontAwesomeIcon icon="times"/>
          {t('profile.actions.cancelEdit')}
        </button>
      </div>
    </>
  );
};

export default ProfileEditForm;
