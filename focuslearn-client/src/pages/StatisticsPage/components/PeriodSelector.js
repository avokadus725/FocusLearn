import React from 'react';
import { useTranslation } from 'react-i18next';
import './PeriodSelector.css';

const PeriodSelector = ({ selectedPeriod, onPeriodChange, loading }) => {
  const { t } = useTranslation();

  const periods = [
    {
      key: 'day',
      label: t('statistics.periods.day', 'День'),
      icon: 'fas fa-calendar-day'
    },
    {
      key: 'week', 
      label: t('statistics.periods.week', 'Тиждень'),
      icon: 'fas fa-calendar-week'
    },
    {
      key: 'month',
      label: t('statistics.periods.month', 'Місяць'),
      icon: 'fas fa-calendar-alt'
    }
  ];

  return (
    <div className="period-selector">
      <div className="period-selector-header">
        <h3 className="period-selector-title">
          {t('statistics.selectPeriod', 'Оберіть період')}
        </h3>
      </div>
      
      <div className="period-selector-buttons">
        {periods.map((period) => (
          <button
            key={period.key}
            className={`period-btn ${selectedPeriod === period.key ? 'period-btn-active' : ''}`}
            onClick={() => onPeriodChange(period.key)}
            disabled={loading}
          >
            <i className={period.icon}></i>
            <span>{period.label}</span>
            {loading && selectedPeriod === period.key && (
              <i className="fas fa-spinner fa-spin"></i>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeriodSelector;