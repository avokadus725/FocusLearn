import React from 'react';
import { useTranslation } from 'react-i18next';
import './StatisticsCards.css';

const StatisticsCards = ({ 
  userStatistics, 
  mostEffectiveMethod, 
  productivityCoefficient, 
  productivityPrediction,
  selectedPeriod 
}) => {
  const { t } = useTranslation();

  // Форматування часу в хвилини та години
  const formatTime = (minutes) => {
    if (!minutes) return '0 хв';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}г ${mins}хв`;
    }
    return `${mins}хв`;
  };

  // Отримати назву методики з повідомлення
  const getMethodName = (message) => {
    if (!message) return t('statistics.noData', 'Немає даних');
    
    const match = message.match(/'([^']+)'/);
    return match ? match[1] : t('statistics.noData', 'Немає даних');
  };

  const cards = [
    {
      id: 'total-time',
      title: t('statistics.cards.totalTime', 'Загальний час концентрації'),
      value: formatTime(userStatistics.totalConcentrationTime),
      icon: 'fas fa-clock',
      color: 'primary',
      description: t('statistics.cards.totalTimeDesc', 'Час активної роботи')
    },
    {
      id: 'productivity',
      title: t('statistics.cards.productivity', 'Коефіцієнт продуктивності'),
      value: `${productivityCoefficient.productivityCoefficient || 0}%`,
      icon: 'fas fa-chart-line',
      color: 'success',
      description: t('statistics.cards.productivityDesc', 'Ефективність роботи')
    },
    {
      id: 'effective-method',
      title: t('statistics.cards.effectiveMethod', 'Найефективніша методика'),
      value: getMethodName(mostEffectiveMethod.message),
      icon: 'fas fa-trophy',
      color: 'warning',
      description: t('statistics.cards.effectiveMethodDesc', 'Рекомендована методика')
    },
    {
      id: 'improvement',
      title: t('statistics.cards.improvement', 'Потенціал покращення'),
      value: `+${productivityPrediction.improvementPercentage || 0}%`,
      icon: 'fas fa-arrow-up',
      color: 'info',
      description: t('statistics.cards.improvementDesc', 'Можливе зростання')
    }
  ];

  const getCardColorClass = (color) => {
    switch (color) {
      case 'primary': return 'stats-card-primary';
      case 'success': return 'stats-card-success';
      case 'warning': return 'stats-card-warning';
      case 'info': return 'stats-card-info';
      default: return 'stats-card-primary';
    }
  };

  return (
    <div className="statistics-cards">
      <div className="statistics-cards-grid">
        {cards.map((card) => (
          <div key={card.id} className={`stats-card ${getCardColorClass(card.color)}`}>
            <div className="stats-card-header">
              <div className="stats-card-icon">
                <i className={card.icon}></i>
              </div>
              <div className="stats-card-info">
                <h3 className="stats-card-title">{card.title}</h3>
                <p className="stats-card-description">{card.description}</p>
              </div>
            </div>
            
            <div className="stats-card-value">
              {card.value}
            </div>
            
            {/* Додatkова інформація для деяких карток */}
            {card.id === 'total-time' && userStatistics.breakCount > 0 && (
              <div className="stats-card-extra">
                <div className="stats-extra-item">
                  <i className="fas fa-coffee"></i>
                  <span>{userStatistics.breakCount} {t('statistics.breaks', 'перерв')}</span>
                </div>
                {userStatistics.missedBreaks > 0 && (
                  <div className="stats-extra-item missed">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{userStatistics.missedBreaks} {t('statistics.missedBreaks', 'пропущено')}</span>
                  </div>
                )}
              </div>
            )}
            
            {card.id === 'improvement' && productivityPrediction.recommendations?.length > 0 && (
              <div className="stats-card-recommendations">
                <button 
                  className="stats-recommendations-toggle"
                  onClick={() => {
                    const content = document.getElementById(`recommendations-${card.id}`);
                    content.classList.toggle('show');
                  }}
                >
                  <i className="fas fa-lightbulb"></i>
                  {t('statistics.showRecommendations', 'Рекомендації')}
                </button>
                <div id={`recommendations-${card.id}`} className="stats-recommendations-content">
                  {productivityPrediction.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="stats-recommendation-item">
                      <i className="fas fa-arrow-right"></i>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsCards;