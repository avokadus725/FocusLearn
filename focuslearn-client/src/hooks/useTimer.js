// src/hooks/useTimer.js
import { useState, useEffect, useCallback, useRef } from 'react';
import timerService from '../services/timerService';

export const useTimer = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionState, setSessionState] = useState('idle'); // idle, active, paused, completed
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionType, setSessionType] = useState(null); // 'Concentration' | 'Break'
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const unsubscribeRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Ініціалізація підключення
  const initializeConnection = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      await timerService.connect(userId);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to connect to timer service:', err);
      setError('Не вдалося підключитися до сервісу таймера');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Обробка подій від таймер сервіса
  const handleTimerEvent = useCallback((event, data) => {
    console.log('Timer event received:', event, data);

    switch (event) {
      case 'sessionStarted':
        setSessionState('active');
        setCurrentSession(data);
        setSessionType(data.SessionType);
        setTimeRemaining(data.SessionType === 'Concentration' ? 
          data.WorkDuration * 60 : data.BreakDuration * 60);
        break;

      case 'sessionUpdate':
        setCurrentSession(data);
        setSessionType(data.SessionType);
        setTimeRemaining(data.timeRemaining || 0);
        
        if (data.status === 'completed') {
          setSessionState('completed');
          playNotificationSound();
          
          // Автоматично очищуємо через 3 секунди
          setTimeout(() => {
            if (data.nextSession) {
              // Автоматично переходимо до наступної сесії (перерва)
              setSessionState('active');
              setSessionType(data.nextSession.SessionType);
              setTimeRemaining(data.nextSession.duration * 60);
            } else {
              // Повертаємося до вибору методики
              resetSession();
            }
          }, 3000);
        }
        break;

      case 'sessionComplete':
        setSessionState('completed');
        playNotificationSound();
        
        // Показуємо завершення 3 секунди, потім скидаємо
        setTimeout(() => {
          resetSession();
        }, 3000);
        break;

      default:
        console.log('Unknown timer event:', event, data);
    }
  }, []);

  // Програвання звукового сигналу
  const playNotificationSound = useCallback(() => {
    try {
      // Створюємо простий звуковий сигнал
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = sessionType === 'Concentration' ? 800 : 500;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
      
      if ('serviceWorker' in navigator && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('FocusLearn', {
            body: sessionType === 'Concentration' ? 
              'Час концентрації завершено!' : 'Час перерви завершено!',
            icon: '/favicon.ico'
          });
        }
      }
    }
  }, [sessionType]);

  // Локальний таймер для плавного відображення
  useEffect(() => {
    if (sessionState === 'active' && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [sessionState, timeRemaining]);

  // Підписка на події при підключенні
  useEffect(() => {
    if (isConnected) {
      unsubscribeRef.current = timerService.addListener(handleTimerEvent);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isConnected, handleTimerEvent]);

  // Ініціалізація при монтуванні
  useEffect(() => {
    initializeConnection();

    return () => {
      timerService.disconnect();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [initializeConnection]);

  // Запуск сесії
  const startSession = useCallback(async (methodData) => {
    try {
      setError(null);
      await timerService.startSession(methodData);
    } catch (err) {
      console.error('Failed to start session:', err);
      setError('Не вдалося запустити сесію');
    }
  }, []);

  // Зупинка сесії
  const stopSession = useCallback(async () => {
    try {
      setError(null);
      await timerService.stopSession();
      setSessionState('idle');
      setCurrentSession(null);
      setTimeRemaining(0);
      setSessionType(null);
    } catch (err) {
      console.error('Failed to stop session:', err);
      setError('Не вдалося зупинити сесію');
    }
  }, []);

  // Скидання сесії
  const resetSession = useCallback(() => {
    setSessionState('idle');
    setCurrentSession(null);
    setTimeRemaining(0);
    setSessionType(null);
    setError(null);
  }, []);

  // Форматування часу
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // Стан підключення
    isConnected,
    isLoading,
    error,
    
    // Стан сесії
    sessionState,
    currentSession,
    sessionType,
    timeRemaining,
    
    // Дії
    startSession,
    stopSession,
    resetSession,
    
    // Утиліти
    formatTime,
    
    // Перепідключення
    reconnect: initializeConnection
  };
};