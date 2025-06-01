// src/hooks/useMethods.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import concentrationService from '../api/concentrationService';
import timerService from '../api/timerService';

export const useMethods = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Основні стани
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

  const pollingIntervalRef = useRef(null);

  // Завантаження методик
  const loadMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await concentrationService.getAllMethods();
      setMethods(data);
      
    } catch (err) {
      console.error('Error loading methods:', err);
      setError(t('methods.errors.loadError', 'Помилка завантаження методик'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Перевірка активної сесії
  const checkActiveSession = useCallback(async () => {
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
      console.error('Error checking session:', error);
      setActiveSession(null);
      setTimerMode(false);
    }
  }, []);

  // Polling для оновлення стану таймера
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
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
        console.error('Polling error:', error);
        setActiveSession(null);
        setTimerMode(false);
        stopPolling();
      }
    }, 1000);

    setPollingInterval(pollingIntervalRef.current);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setPollingInterval(null);
  }, []);

  // Показ повідомлення
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
  }, []);

  // Показ нотифікації
  const showNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body, icon: '/favicon.ico' });
        }
      });
    }
  }, []);

  // Запуск нової сесії
  const handleStartSession = useCallback(async (methodId) => {
    try {
      if (!methodId) {
        showMessage('error', 'Method ID is missing');
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
          'Сесію концентрації розпочано'
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
      
      showMessage('error', errorMessage);
    }
  }, [showMessage, showNotification, startPolling]);

  // Пауза/відновлення
  const handlePauseSession = useCallback(async () => {
    try {
      const response = await timerService.pauseSession();
      
      if (response && response.data) {
        setActiveSession(response.data);
        
        const messageKey = response.data.isPaused ? 'Сесію призупинено' : 'Сесію відновлено';
        showMessage('success', messageKey);
      }
      
    } catch (err) {
      console.error('Error pausing session:', err);
      showMessage('error', 'Помилка паузи');
    }
  }, [showMessage]);

  // Завершення сесії
  const handleStopSession = useCallback(async () => {
    try {
      await timerService.stopSession();
      
      setActiveSession(null);
      setTimerMode(false);
      stopPolling();
      
      showMessage('success', 'Сесію завершено');
      showNotification('Сесію завершено', 'Сесію концентрації завершено');
      
    } catch (err) {
      console.error('Error stopping session:', err);
      showMessage('error', 'Error stopping session');
    }
  }, [showMessage, showNotification, stopPolling]);

  // Завершення фази
  const handlePhaseComplete = useCallback(async () => {
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
  }, [showNotification]);

  // Обробка навігації
  const handleNavigationConfirm = useCallback(() => {
    setShowNavigationModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setPendingNavigation(null);
  }, [pendingNavigation, navigate]);

  const handleNavigationCancel = useCallback(() => {
    setShowNavigationModal(false);
    setPendingNavigation(null);
  }, []);

  const handleNavigationAttempt = useCallback((href) => {
    if (!activeSession || !timerMode || href === location.pathname) return false;
    
    setPendingNavigation(href);
    setShowNavigationModal(true);
    return true;
  }, [activeSession, timerMode, location.pathname]);

  // Перезавантаження методик
  const retryLoading = useCallback(() => {
    loadMethods();
  }, [loadMethods]);

  // Ініціалізація
  useEffect(() => {
    loadMethods();
    checkActiveSession();
    
    return () => {
      stopPolling();
    };
  }, [loadMethods, checkActiveSession, stopPolling]);

  return {
    // Стани
    methods,
    loading,
    error,
    message,
    activeSession,
    timerMode,
    showNavigationModal,
    
    // Дії таймера
    handleStartSession,
    handlePauseSession,
    handleStopSession,
    
    // Дії навігації
    handleNavigationConfirm,
    handleNavigationCancel,
    handleNavigationAttempt,
    
    // Утиліти
    retryLoading,
    showNotification,
    
    // Перевірки
    hasActiveSession: Boolean(activeSession && timerMode)
  };
};