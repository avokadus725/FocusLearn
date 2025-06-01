// src/pages/MethodsPage/MethodsPage.js
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import Timer from './components/Timer';
import MethodsList from './components/MethodsList';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useMethods } from '../../hooks/useMethods';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './MethodsPage.css';

const MethodsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  
  const {
    methods,
    loading,
    error,
    message,
    activeSession,
    timerMode,
    showNavigationModal,
    handleStartSession,
    handlePauseSession,
    handleStopSession,
    handleNavigationConfirm,
    handleNavigationCancel,
    handleNavigationAttempt,
    retryLoading,
    hasActiveSession
  } = useMethods();

  // Захист від закриття браузера
  useEffect(() => {
    if (!hasActiveSession) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'У вас активна сесія. Покинути сторінку?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasActiveSession]);

  // Перехоплення навігації через кліки
  useEffect(() => {
    if (!hasActiveSession) return;

    const handleClick = (e) => {
      const link = e.target.closest('a[href]');
      if (link) {
        const href = link.getAttribute('href');
        
        if (!href || href.startsWith('http')) return;

        if (handleNavigationAttempt(href)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [hasActiveSession, handleNavigationAttempt]);

  if (loading) {
    return (
      <Layout>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">{t('common.loading', 'Завантаження...')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      activeSession={activeSession} 
      timerMode={timerMode}
      className="methods-page-layout"
    >
      <div className="methods-page">
        <div className="container container-xl px-4 py-8">
          
          {/* Заголовок сторінки */}
          {!timerMode && (
            <header className="text-center mb-8">
              <h1 className="heading-1 mb-2">
                {t('methods.title', 'Методики концентрації')}
              </h1>
              <p className="body-large text-gray-600">
                {t('methods.subtitle', 'Оберіть методику для покращення концентрації')}
              </p>
            </header>
          )}

          {/* Повідомлення */}
          {message.text && (
            <div className={`alert alert-${message.type} mb-6`}>
              <div className="alert-icon">
                <FontAwesomeIcon icon={message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} />
              </div>
              <div className="alert-content">
                {message.text}
              </div>
            </div>
          )}

          {/* Помилка завантаження */}
          {error && (
            <div className="alert alert-danger mb-6">
              <div className="alert-icon">
                <FontAwesomeIcon icon="exclamation-triangle" />
              </div>
              <div className="alert-content">
                {error}
              </div>
              <button 
                className="btn btn-outline btn-sm ml-auto"
                onClick={retryLoading}
              >
                {t('common.retry', 'Спробувати знову')}
              </button>
            </div>
          )}

          <div className="methods-content">
            {timerMode && activeSession ? (
              // Режим таймера
              <Timer
                session={activeSession}
                onPause={handlePauseSession}
                onStop={handleStopSession}
              />
            ) : (
              // Режим списку методик
              <MethodsList
                methods={methods}
                onStartSession={handleStartSession}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Модальне вікно підтвердження навігації */}
      <ConfirmationModal
        isOpen={showNavigationModal}
        onClose={handleNavigationCancel}
        onConfirm={handleNavigationConfirm}
        title={t('session.modal.title', 'Активна сесія')}
        message={t('session.modal.message', 'У вас активна сесія. Покинути сторінку?')}
        confirmText={t('session.modal.leave', 'Покинути')}
        cancelText={t('session.modal.stay', 'Залишитись')}
        confirmVariant="warning"
        icon={<FontAwesomeIcon icon="exclamation-triangle" />}
      />
    </Layout>
  );
};

export default MethodsPage;