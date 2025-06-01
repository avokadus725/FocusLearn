import React from 'react';
import { useTranslation } from 'react-i18next';
import './Timer.css';

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
          <i className="fas fa-exclamation-triangle"></i>
          <p>{t('methods.timer.errors.noSession')}</p>
          <button className="timer-btn timer-btn-secondary" onClick={onBack}>
            <i className="fas fa-arrow-left"></i>
            {t('methods.timer.backToMethods')}
          </button>
        </div>
      </div>
    );
  }

// Додай ці покращення до свого Timer компонента

return (
  <div className="timer-container">
    
    {/* Заголовок таймера */}
    <div className="timer-header">
      <div className="timer-method-info">
        <h2 className="timer-method-title">{session.methodTitle}</h2>
        <span className="timer-cycle-info">
          {t('methods.timer.cycle')} {session.currentCycle}
        </span>
      </div>
    </div>

    {/* Основний таймер */}
    <div className="timer-main">
      
      {/* Індикатор стану в правому куті */}
      <div className={`timer-status-indicator timer-status-${session.currentPhase?.toLowerCase()}`}>
        {session.currentPhase ? t(`methods.timer.phases.${session.currentPhase.toLowerCase()}`) : ''}
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
              stroke="#E2E8F0"
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
              <i className={`fas fa-${session.currentPhase === 'Work' ? 'brain' : 'coffee'}`}></i>
              <span className="timer-phase-text">
                {session.currentPhase ? t(`methods.timer.phases.${session.currentPhase.toLowerCase()}`) : ''}
              </span>
            </div>
            
            <div className="timer-time-display">
              {formatTime(session.remainingSeconds)}
            </div>
            
            {session.isPaused && (
              <div className="timer-paused-indicator">
                <i className="fas fa-pause"></i>
                <span>{t('methods.timer.paused')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Компактна інформація про сесію */}
      <div className="timer-session-info">
        <div className="timer-info-item">
          <i className="fas fa-play"></i>
          <div>
            <div className="timer-info-value">{session.workDurationMinutes} {t('common.minutes')}</div>
            <div>{t('methods.timer.phases.work')}</div>
          </div>
        </div>
        <div className="timer-info-item">
          <i className="fas fa-pause"></i>
          <div>
            <div className="timer-info-value">{session.breakDurationMinutes} {t('common.minutes')}</div>
            <div>{t('methods.timer.phases.break')}</div>
          </div>
        </div>
        <div className="timer-info-item">
          <i className="fas fa-clock"></i>
          <div>
            <div className="timer-info-value">{formatTime(session.elapsedSeconds)}</div>
            <div>{t('methods.timer.elapsed')}</div>
          </div>
        </div>
      </div>

      {/* Кнопки керування */}
      <div className="timer-controls">
        
        {/* Кнопка Пауза/Продовжити (тільки для робочої фази) */}
        {session.currentPhase === 'Work' && (
          <button
            className={`timer-btn timer-btn-${session.isPaused ? 'success' : 'warning'}`}
            onClick={onPause}
          >
            <i className={`fas fa-${session.isPaused ? 'play' : 'pause'}`}></i>
            {t(`methods.timer.${session.isPaused ? 'resume' : 'pause'}`)}
          </button>
        )}

        {/* Індикатор для перерви */}
        {session.currentPhase === 'Break' && (
          <div className="timer-break-indicator">
            <i className="fas fa-coffee"></i>
            <span>{t('methods.timer.breakInProgress')}</span>
          </div>
        )}

        {/* Кнопка Завершити */}
        <button
          className="timer-btn timer-btn-danger"
          onClick={onStop}
        >
          <i className="fas fa-stop"></i>
          {t('methods.timer.stop')}
        </button>
      </div>

      {/* Покращений прогрес-бар */}
      <div className="timer-progress-bar">
        <div className="timer-progress-bar-label">
          <span>{t('methods.timer.phaseProgress')}</span>
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
);
};

export default Timer;