// src/pages/MethodsPage/components/Timer.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import './Timer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Timer = ({ session, onPause, onStop, onBack }) => {
  const { t } = useTranslation();

  // Форматування часу
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Відсоток прогресу
  const getProgress = () => {
    if (!session) return 0;
    const total = session.phaseDurationMinutes * 60;
    const elapsed = session.elapsedSeconds;
    return Math.min((elapsed / total) * 100, 100);
  };

  // Колір прогрес-бару залежно від фази
  const getProgressColor = () => {
    return session?.currentPhase === 'Work' ? '#548c54' : '#4CAF50';
  };

  if (!session) {
    return (
      <div className="timer-container">
        <div className="timer-error">
          <FontAwesomeIcon icon="exclamation-triangle"/>
          <p>{t('methods.timer.errors.noSession', 'Сесія не знайдена')}</p>
          <button className="btn btn-secondary" onClick={onBack}>
            <FontAwesomeIcon icon="arrow-left"/>
            {t('methods.timer.backToMethods', 'Назад до методик')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="timer-container">
      
      {/* Заголовок таймера */}
      <div className="card mb-8">
        <div className="card-body text-center timer-header-content">
          <h2 className="heading-2 mb-2">{session.methodTitle}</h2>
          <span className="timer-cycle-info">
            {t('methods.timer.cycle', 'Цикл')} {session.currentCycle}
          </span>
        </div>
      </div>

      {/* Основний таймер */}
      <div className="card timer-main">
        <div className="card-body">
          
          {/* Індикатор стану в правому куті */}
          <div className={`timer-status-indicator timer-status-${session.currentPhase?.toLowerCase()}`}>
            {session.currentPhase ? t(`methods.timer.phases.${session.currentPhase.toLowerCase()}`, session.currentPhase) : ''}
          </div>
          
          {/* Круговий прогрес */}
          <div className="timer-circle-container">
            <div className="timer-circle">
              <svg className="timer-progress-ring" width="300" height="300">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={getProgressColor()} />
                    <stop offset="50%" stopColor={session.currentPhase === 'Work' ? '#38a169' : '#48bb78'} />
                    <stop offset="100%" stopColor={session.currentPhase === 'Work' ? '#2a633a' : '#388E3C'} />
                  </linearGradient>
                </defs>
                
                {/* Фоновий круг */}
                <circle
                  cx="150"
                  cy="150"
                  r="140"
                  fill="none"
                  stroke="var(--color-gray-200)"
                  strokeWidth="10"
                />
                
                {/* Прогрес */}
                <circle
                  cx="150"
                  cy="150"
                  r="140"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 140}
                  strokeDashoffset={2 * Math.PI * 140 * (1 - getProgress() / 100)}
                  transform="rotate(-90 150 150)"
                  className="timer-progress-circle"
                />
              </svg>
              
              {/* Центральний контент */}
              <div className="timer-center-content">
                <div className="timer-phase-indicator">
                  <FontAwesomeIcon icon={`${session.currentPhase === 'Work' ? 'brain' : 'coffee'}`}/>
                  <span className="timer-phase-text">
                    {session.currentPhase ? t(`methods.timer.phases.${session.currentPhase.toLowerCase()}`, session.currentPhase) : ''}
                  </span>
                </div>
                
                <div className="timer-time-display">
                  {formatTime(session.remainingSeconds)}
                </div>
                
                {session.isPaused && (
                  <div className="timer-paused-indicator">
                    <FontAwesomeIcon icon="pause"/>
                    <span>{t('methods.timer.paused', 'Пауза')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Компактна інформація про сесію */}
          <div className="timer-session-info">
            <div className="timer-info-item">
              <FontAwesomeIcon icon="play"/>
              <div>
                <div className="timer-info-value">{session.workDurationMinutes} {t('common.minutes', 'хв')}</div>
                <div>{t('methods.timer.phases.work', 'Робота')}</div>
              </div>
            </div>
            <div className="timer-info-item">
              <FontAwesomeIcon icon="pause"/>
              <div>
                <div className="timer-info-value">{session.breakDurationMinutes} {t('common.minutes', 'хв')}</div>
                <div>{t('methods.timer.phases.break', 'Перерва')}</div>
              </div>
            </div>
            <div className="timer-info-item">
              <FontAwesomeIcon icon="clock"/>
              <div>
                <div className="timer-info-value">{formatTime(session.elapsedSeconds)}</div>
                <div>{t('methods.timer.elapsed', 'Минуло')}</div>
              </div>
            </div>
          </div>

          {/* Кнопки керування */}
          <div className="timer-controls">
            
            {/* Кнопка Пауза/Продовжити (тільки для робочої фази) */}
            {session.currentPhase === 'Work' && (
              <button
                className={`btn timer-btn ${session.isPaused ? 'btn-success' : 'btn-warning'}`}
                onClick={onPause}
              >
                <FontAwesomeIcon icon={`${session.isPaused ? 'play' : 'pause'}`}/>
                {t(`methods.timer.${session.isPaused ? 'resume' : 'pause'}`, session.isPaused ? 'Продовжити' : 'Пауза')}
              </button>
            )}

            {/* Індикатор для перерви */}
            {session.currentPhase === 'Break' && (
              <div className="timer-break-indicator">
                <FontAwesomeIcon icon="coffee"/>
                <span>{t('methods.timer.breakInProgress', 'Перерва триває')}</span>
              </div>
            )}

            {/* Кнопка Завершити */}
            <button
              className="btn btn-danger timer-btn"
              onClick={onStop}
            >
              <FontAwesomeIcon icon="stop"/>
              {t('methods.timer.stop', 'Завершити')}
            </button>
          </div>

          {/* Покращений прогрес-бар */}
          <div className="timer-progress-bar">
            <div className="timer-progress-bar-label">
              <span>{t('methods.timer.phaseProgress', 'Прогрес фази')}</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <div className="timer-progress-bar-track">
              <div 
                className="timer-progress-bar-fill"
                style={{ 
                  width: `${getProgress()}%`,
                  backgroundColor: getProgressColor()
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;