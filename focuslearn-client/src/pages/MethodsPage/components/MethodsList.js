// src/pages/MethodsPage/components/MethodsList.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './MethodsList.css';

const MethodsList = ({ methods, onStartSession, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">{t('common.loading', 'Завантаження...')}</p>
      </div>
    );
  }

  if (!methods || methods.length === 0) {
    return (
      <div className="methods-empty-state">
        <div className="empty-state-icon">
          <FontAwesomeIcon icon="clock"/>
        </div>
        <h3 className="heading-3 mb-2">
          {t('methods.empty.title', 'Методики недоступні')}
        </h3>
        <p className="body-normal text-gray-500">
          {t('methods.empty.description', 'На даний момент методики недоступні')}
        </p>
      </div>
    );
  }

  return (
    <div className="methods-list">
      
      {/* Заголовок списку */}
      <div className="card mb-8">
        <div className="card-body text-center">
          <h2 className="heading-3 mb-3 methods-list-title">
            {t('methods.selectMethod', 'Оберіть методику')}
          </h2>
          <p className="body-normal text-gray-600 mb-4">
            {t('methods.selectMethodDescription', 'Виберіть підходящу методику для концентрації')}
          </p>
          <span className="methods-count">
            {methods.length} {t('methods.methodsAvailable', 'методик доступно')}
          </span>
        </div>
      </div>

      {/* Сітка методик */}
      <div className="methods-grid">
        {methods.map((method) => {
          // Отримуємо methodId з різних можливих полів
          const methodId = method.id || method.methodId || method.MethodId || method.ID;
          
          return (
            <div key={methodId || method.title} className="card card-hover method-card">
              
              {/* Заголовок картки */}
              <div className="method-card-header">
                <div className="method-icon">
                  <FontAwesomeIcon icon="clock"/>
                </div>
                <h3 className="method-title">{method.title || method.Title}</h3>
              </div>

              {/* Опис методики */}
              {(method.description || method.Description) && (
                <div className="card-body">
                  <p className="body-small text-gray-600">
                    {method.description || method.Description}
                  </p>
                </div>
              )}

              {/* Параметри методики */}
              <div className="method-params">
                <div className="method-param">
                  <div className="param-icon work-icon">
                    <FontAwesomeIcon icon="play"/>
                  </div>
                  <div className="param-info">
                    <span className="param-label">{t('methods.workDuration', 'Робота')}</span>
                    <span className="param-value">
                      {method.workDuration || method.WorkDuration || method.WorkDurationMinutes} {t('common.minutes', 'хв')}
                    </span>
                  </div>
                </div>
                
                <div className="method-param">
                  <div className="param-icon break-icon">
                    <FontAwesomeIcon icon="coffee"/>
                  </div>
                  <div className="param-info">
                    <span className="param-label">{t('methods.breakDuration', 'Перерва')}</span>
                    <span className="param-value">
                      {method.breakDuration || method.BreakDuration || method.BreakDurationMinutes} {t('common.minutes', 'хв')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Кнопка запуску */}
              <div className="card-body pt-0">
                <button
                  className="btn btn-primary w-full method-start-btn"
                  onClick={() => {
                    
                    if (!methodId) {
                      alert('Error: Method ID not found');
                      return;
                    }
                    
                    onStartSession(methodId);
                  }}
                  disabled={!methodId}
                >
                  <FontAwesomeIcon icon="play"/>
                  {t('methods.startSession', 'Почати сесію')}
                </button>
              </div>

              {/* Додаткові відомості */}
              <div className="method-card-footer">
                <div className="method-cycle-info">
                  <FontAwesomeIcon icon="sync-alt"/>
                  <span>{t('methods.continuousCycles', 'Безперервні цикли')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Додаткова інформація */}
      <div className="card mt-8">
        <div className="card-body methods-info-card">
          <div className="info-icon">
            <FontAwesomeIcon icon="info"/>
          </div>
          <div className="info-content">
            <h4 className="heading-4 mb-4">{t('methods.howItWorks.title', 'Як це працює')}</h4>
            <ul className="info-list">
              <li>{t('methods.howItWorks.step1', 'Оберіть методику концентрації')}</li>
              <li>{t('methods.howItWorks.step2', 'Працюйте протягом робочого періоду')}</li>
              <li>{t('methods.howItWorks.step3', 'Робіть перерву між циклами')}</li>
              <li>{t('methods.howItWorks.step4', 'Повторюйте цикли для кращої концентрації')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodsList;