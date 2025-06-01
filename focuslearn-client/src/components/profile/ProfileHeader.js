// src/components/profile/ProfileHeader.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import ProfileAvatar from './ProfileAvatar';

const ProfileHeader = ({ user }) => {
  const { t } = useTranslation();
  
  return (
    <div className="card-header card-gradient-header text-center profile-header-centered">
      <div className="profile-avatar-container">
        <ProfileAvatar user={user} size="large" />
      </div>
      <h2 className="heading-3 mb-2" style={{ color: 'white' }}>
        {user?.userName || user?.email}
      </h2>
      <p className="text-lg opacity-90 mb-0" style={{ color: 'white' }}>
        {user?.email}
      </p>
    </div>
  );
};

export default ProfileHeader;