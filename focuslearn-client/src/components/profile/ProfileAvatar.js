// src/components/profile/ProfileAvatar.js
import React, { useState } from 'react';
import { getProxiedImageUrl, generateInitialsAvatar, isValidImageUrl } from '../../utils/imageConverter';

const ProfileAvatar = ({ user, size = 'large' }) => {
  const [imageError, setImageError] = useState(false);
  
  const profileImageUrl = getProxiedImageUrl(user?.profilePhoto);
  const shouldShowImage = profileImageUrl && !imageError && isValidImageUrl(user?.profilePhoto);
  const userInitials = generateInitialsAvatar(user?.userName, user?.email);
  
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-12 h-12 text-base',
    large: 'profile-avatar-large'
  };

  return (
    <div className={sizeClasses[size]}>
      {shouldShowImage ? (
        <img 
          src={profileImageUrl} 
          alt="Profile" 
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div className="profile-avatar-placeholder">
          {userInitials}
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;