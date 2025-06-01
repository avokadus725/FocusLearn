import React from 'react';
import { useTranslation } from 'react-i18next';
import './ConfirmationModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmVariant = 'danger',
  icon,
  isLoading = false
}) => {
  const { t } = useTranslation();

  // Ефект для керування overflow body
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Ефект для обробки Escape
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Обробка кліку на overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="confirmation-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirmation-modal">
        
        {/* Іконка та заголовок */}
        <div className="confirmation-modal-header">
          <h3 className="confirmation-title">
            {title || t('common.confirmation.title')}
          </h3>
        </div>

        {/* Повідомлення */}
        <div className="confirmation-modal-body">
          <p className="confirmation-message">
            {message || t('common.confirmation.message')}
          </p>
        </div>

        {/* Кнопки дій */}
        <div className="confirmation-modal-actions">
          <button
            type="button"
            className="confirmation-btn confirmation-btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText || t('common.cancel')}
          </button>
          <button
            type="button"
            className={`confirmation-btn confirmation-btn-${confirmVariant}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                {t('common.processing')}
              </>
            ) : (
              <>
                {confirmText || t('common.confirm')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;