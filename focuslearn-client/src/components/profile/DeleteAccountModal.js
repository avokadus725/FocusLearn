// src/components/profile/DeleteAccountModal.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title flex items-center gap-2">
            <FontAwesomeIcon icon="exclamation-triangle"/>
            {t('profile.deleteAccount')}
          </h3>
        </div>
        <div className="modal-body">
          <p className="body-normal text-gray-600 mb-0">
            {t('profile.messages.deleteConfirmation')}
          </p>
        </div>
        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            {t('common.cancel')}
          </button>
          <button 
            className="btn btn-danger"
            onClick={onConfirm}
          >
            <FontAwesomeIcon icon="trash" />
            {t('profile.actions.confirmDelete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;