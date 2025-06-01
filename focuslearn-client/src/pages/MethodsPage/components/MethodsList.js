import React from 'react';
import { useTranslation } from 'react-i18next';
import './MethodsList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const MethodsList = ({ methods, onStartSession, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="methods-list-loading">
        <div className="methods-loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!methods || methods.length === 0) {
    return (
      <div className="methods-empty-state">
        <div className="empty-state-icon">
          <FontAwesomeIcon icon="clock"/>
        </div>
        <h3 className="empty-state-title">
          {t('methods.empty.title')}
        </h3>
        <p className="empty-state-description">
          {t('methods.empty.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="methods-list">
      
      {/* Заголовок списку */}
      <div className="methods-list-header">
        <h2 className="methods-list-title">
          <i className="fas fa-list"></i>
          {t('methods.selectMethod')}
        </h2>
        <p className="methods-list-description">
          {t('methods.selectMethodDescription')}
        </p>
        <div className="methods-count">
          {methods.length} {t('methods.methodsAvailable')}
        </div>
      </div>

      {/* Сітка методик */}
      <div className="methods-grid">
        {methods.map((method) => {
          // Детальне логування для діагностики
          console.log('Method object:', method);
          console.log('Available keys:', Object.keys(method));
          
          // Спробуємо різні варіанти назв полів
          const methodId = method.id || method.methodId || method.MethodId || method.ID;
          
          console.log('Using methodId:', methodId);
          
          return (
            <div key={methodId || method.title} className="method-card">
              
              {/* Заголовок картки */}
              <div className="method-card-header">
                <div className="method-icon">
                  <FontAwesomeIcon icon="clock"/>
                </div>
                <h3 className="method-title">{method.title || method.Title}</h3>
              </div>

              {/* Опис методики */}
              {(method.description || method.Description) && (
                <div className="method-description">
                  <p>{method.description || method.Description}</p>
                </div>
              )}

              {/* Параметри методики */}
              <div className="method-params">
                <div className="method-param">
                  <div className="param-icon work-icon">
                    <FontAwesomeIcon icon="play"/>
                  </div>
                  <div className="param-info">
                    <span className="param-label">{t('methods.workDuration')}</span>
                    <span className="param-value">
                      {method.workDuration || method.WorkDuration || method.WorkDurationMinutes} {t('common.minutes')}
                    </span>
                  </div>
                </div>
                
                <div className="method-param">
                  <div className="param-icon break-icon">
                    <FontAwesomeIcon icon="coffee"/>
                  </div>
                  <div className="param-info">
                    <span className="param-label">{t('methods.breakDuration')}</span>
                    <span className="param-value">
                      {method.breakDuration || method.BreakDuration || method.BreakDurationMinutes} {t('common.minutes')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Кнопка запуску */}
              <div className="method-card-actions">
                <button
                  className="method-start-btn"
                  onClick={() => {
                    console.log('Full method object before starting:', JSON.stringify(method, null, 2));
                    console.log('Starting session for methodId:', methodId);
                    
                    if (!methodId) {
                      console.error('No valid methodId found! Method object:', method);
                      alert('Error: Method ID not found');
                      return;
                    }
                    
                    onStartSession(methodId);
                  }}
                  disabled={!methodId}
                >
                  <i className="fas fa-play"></i>
                  {t('methods.startSession')}
                </button>
              </div>

              {/* Додаткові відомості */}
              <div className="method-card-footer">
                <div className="method-cycle-info">
                  <i className="fas fa-sync-alt"></i>
                  <span>{t('methods.continuousCycles')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Додаткова інформація */}
      <div className="methods-info-section">
        <div className="methods-info-card">
          <div className="info-icon">
            <FontAwesomeIcon icon="info"/>
          </div>
          <div className="info-content">
            <h4 className="info-title">{t('methods.howItWorks.title')}</h4>
            <ul className="info-list">
              <li>{t('methods.howItWorks.step1')}</li>
              <li>{t('methods.howItWorks.step2')}</li>
              <li>{t('methods.howItWorks.step3')}</li>
              <li>{t('methods.howItWorks.step4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodsList;