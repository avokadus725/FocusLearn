import { useTranslation } from 'react-i18next';
import './PeriodSelector.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PeriodSelector = ({ selectedPeriod, onPeriodChange, loading }) => {
  const { t } = useTranslation();

  const periods = [
    {
      key: 'day',
      label: t('statistics.periods.day', 'День'),
      icon: 'calendar-day'
    },
    {
      key: 'week', 
      label: t('statistics.periods.week', 'Тиждень'),
      icon: 'calendar-week'
    },
    {
      key: 'month',
      label: t('statistics.periods.month', 'Місяць'),
      icon: 'calendar-alt'
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
            <FontAwesomeIcon icon={period.icon}/>
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