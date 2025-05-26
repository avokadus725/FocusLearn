import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import concentrationService from '../../api/concentrationService';
import timerService from '../../api/timerService';
import Timer from './components/Timer';
import MethodsList from './components/MethodsList';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import './MethodsPage.css';

const MethodsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Стани
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Стани таймера
  const [activeSession, setActiveSession] = useState(null);
  const [timerMode, setTimerMode] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Стани для модального вікна навігації
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Завантаження методик
  const loadMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await concentrationService.getAllMethods();
      setMethods(data);
      
    } catch (err) {
      setError(t('methods.errors.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Перевірка активної сесії при завантаженні
  const checkActiveSession = async () => {
    try {
      console.log('=== Checking Active Session ===');
      const response = await timerService.getSessionStatus();
      
      if (response.success && response.data && response.data.isActive) {
        setActiveSession(response.data);
        setTimerMode(true);
        startPolling();
      } else {
        setActiveSession(null);
        setTimerMode(false);
      }
    } catch (error) {
      setActiveSession(null);
      setTimerMode(false);
    }
  };

  // Polling для оновлення стану таймера
  const startPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const response = await timerService.getSessionStatus();
        
        if (response.success && response.data && response.data.isActive) {
          const sessionData = response.data;
          setActiveSession(sessionData);
          
          if (sessionData.remainingSeconds <= 0) {
            await handlePhaseComplete();
          }
        } else {
          setActiveSession(null);
          setTimerMode(false);
          stopPolling();
        }
      } catch (error) {
        setActiveSession(null);
        setTimerMode(false);
        stopPolling();
      }
    }, 1000);

    setPollingInterval(interval);
  }, [pollingInterval]);

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  // Захист від закриття браузера
  useEffect(() => {
    if (!activeSession || !timerMode) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'У вас активна сесія. Покинути сторінку?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeSession, timerMode]);

  // Перехоплення навігації через кліки
  useEffect(() => {
    if (!activeSession || !timerMode) return;

    const handleClick = (e) => {
      
      const link = e.target.closest('a[href]');
      if (link) {
        const href = link.getAttribute('href');
        
        if (!href || href.startsWith('http') || href === location.pathname) return;

        e.preventDefault();
        e.stopPropagation();
        
        setPendingNavigation(href);
        setShowNavigationModal(true);
        return;
      }
    };

    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [activeSession, timerMode, location.pathname]);

  // Підтвердження навігації
  const confirmNavigation = () => {
    setShowNavigationModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setPendingNavigation(null);
  };

  // Скасування навігації
  const cancelNavigation = () => {
    setShowNavigationModal(false);
    setPendingNavigation(null);
  };

  // Запуск нової сесії
  const handleStartSession = async (methodId) => {
    try {
      if (!methodId) {
        setMessage({ type: 'error', text: 'Method ID is missing' });
        return;
      }
      
      setMessage({ type: '', text: '' });
      
      const response = await timerService.startSession(methodId);
      
      let sessionData = response?.data || response;
      
      if (sessionData) {
        setActiveSession(sessionData);
        setTimerMode(true);
        startPolling();
        
        showNotification(
          'Сесію розпочато',
          `Сесію концентрації розпочато`
        );
      }
      
    } catch (err) {
      console.error('Error starting session:', err);
      
      let errorMessage = 'Помилка запуску сесії';
      
      if (err.response?.data?.data?.message) {
        errorMessage = err.response.data.data.message;
        
        if (errorMessage.includes('активна сесія')) {
          const confirmStop = window.confirm('У вас є активна сесія. Завершити її і почати нову?');
          if (confirmStop) {
            try {
              await timerService.stopSession();
              const response = await timerService.startSession(methodId);
              let sessionData = response?.data || response;
              
              if (sessionData) {
                setActiveSession(sessionData);
                setTimerMode(true);
                startPolling();
                showNotification('Сесію розпочано', 'Нову сесію концентрації розпочано');
                return;
              }
            } catch (stopErr) {
              console.error('Error stopping and restarting:', stopErr);
            }
          }
        }
      }
      
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  // Пауза/відновлення
  const handlePauseSession = async () => {
    try {
      const response = await timerService.pauseSession();
      
      if (response && response.data) {
        setActiveSession(response.data);
        
        const messageKey = response.data.isPaused ? 'Сесію призупинено' : 'Сесію відновлено';
        setMessage({ type: 'success', text: messageKey });
        
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
      
    } catch (err) {
      console.error('Error pausing session:', err);
      setMessage({ type: 'error', text: 'Помилка паузи' });
    }
  };

  // Завершення сесії
  const handleStopSession = async () => {
    try {
      await timerService.stopSession();
      
      setActiveSession(null);
      setTimerMode(false);
      stopPolling();
      
      setMessage({ type: 'success', text: 'Сесію завершено' });
      showNotification('Сесію завершено', 'Сесію концентрації завершено');
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (err) {
      setMessage({ type: 'error', text: 'Error stopping session:' });
    }
  };

  // Завершення фази
  const handlePhaseComplete = async () => {
    try {
      const response = await timerService.completePhase();
      
      if (response && response.data) {
        setActiveSession(response.data);
        
        const isBreak = response.data.currentPhase === 'Break';
        showNotification(
          isBreak ? 'Час перерви' : 'Час роботи',
          isBreak ? 'Розпочинається перерва' : 'Розпочинається робочий період'
        );
      }
      
    } catch (err) {
      console.error('Error completing phase:', err);
    }
  };

  // Ініціалізація
  useEffect(() => {
    loadMethods();
    checkActiveSession();
    
    return () => {
      stopPolling();
    };
  }, []);

  // Показ нотифікації
  const showNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body, icon: '/favicon.ico' });
        }
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="methods-loading">
          <div className="methods-loading-spinner"></div>
          <p>{t('common.loading')}</p>
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
        <div className="methods-container">
          
          {/* Заголовок сторінки */}
          {!timerMode && (
            <div className="methods-header">
              <h1 className="methods-title">{t('methods.title')}</h1>
              <p className="methods-subtitle">{t('methods.subtitle')}</p>
            </div>
          )}

          {/* Повідомлення */}
          {message.text && (
            <div className={`methods-alert methods-alert-${message.type}`}>
              <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
              {message.text}
            </div>
          )}

          {/* Помилка завантаження */}
          {error && (
            <div className="methods-alert methods-alert-error">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
              <button className="methods-retry-btn" onClick={loadMethods}>
                {t('common.retry')}
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
        onClose={cancelNavigation}
        onConfirm={confirmNavigation}
        title={t('session.modal.title')}
        message={t('session.modal.message')}
        confirmText={t('session.modal.leave')}
        cancelText={t('session.modal.stay')}
        confirmVariant="warning"
        icon="fas fa-exclamation-triangle"
      />
    </Layout>
  );
};

export default MethodsPage;