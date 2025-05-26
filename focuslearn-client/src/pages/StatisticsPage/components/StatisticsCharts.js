import React from 'react';
import { useTranslation } from 'react-i18next';
import './StatisticsCharts.css';

const StatisticsCharts = ({ 
  methodStatistics, 
  userStatistics, 
  methods, 
  selectedPeriod,
  productivityPrediction 
}) => {
  const { t } = useTranslation();

  // Кольори для графіків у стилі додатка
  const colors = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#022c22'];
  
  // Підготовка даних для методик
  const prepareMethodsData = () => {
    const methodsMap = new Map();
    
    // Групуємо по методиках та періоду
    methodStatistics
      .filter(stat => stat.periodType.toLowerCase() === selectedPeriod.toLowerCase())
      .forEach(stat => {
        const key = stat.methodId;
        if (methodsMap.has(key)) {
          const existing = methodsMap.get(key);
          existing.totalTime += stat.totalConcentrationTime;
          existing.breakCount += stat.breakCount;
        } else {
          methodsMap.set(key, {
            methodId: stat.methodId,
            name: getMethodName(stat.methodId),
            totalTime: stat.totalConcentrationTime,
            breakCount: stat.breakCount,
            missedBreaks: stat.missedBreaks
          });
        }
      });

    return Array.from(methodsMap.values()).filter(item => item.totalTime > 0);
  };

  // Отримати назву методики за ID
  const getMethodName = (methodId) => {
    const method = methods.find(m => m.id === methodId || m.methodId === methodId);
    return method?.title || method?.name || `Методика ${methodId}`;
  };

  const methodsData = prepareMethodsData();
  const totalTime = methodsData.reduce((sum, item) => sum + item.totalTime, 0);

  // Компонент списку методик з прогрес-барами
  const MethodsList = ({ data }) => (
    <div className="methods-list-chart">
      {data.map((item, index) => {
        const percentage = totalTime > 0 ? (item.totalTime / totalTime) * 100 : 0;
        
        return (
          <div key={index} className="method-item">
            <div className="method-info">
              <div className="method-name">{item.name}</div>
              <div className="method-stats">
                {item.totalTime}хв ({percentage.toFixed(1)}%)
              </div>
            </div>
            <div className="method-bar">
              <div 
                className="method-bar-fill"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: colors[index % colors.length]
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  // Компонент списку активності
  const ActivityList = ({ data }) => (
    <div className="activity-list-chart">
      {data.map((item, index) => (
        <div key={index} className="activity-item">
          <div className="activity-header">
            <span className="activity-name">{item.name}</span>
            <span className="activity-time">{item.totalTime}хв</span>
          </div>
          <div className="activity-details">
            <div className="activity-detail">
              <i className="fas fa-coffee"></i>
              <span>{item.breakCount} перерв</span>
            </div>
            {item.missedBreaks > 0 && (
              <div className="activity-detail missed">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{item.missedBreaks} пропущено</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="statistics-charts">
      
      {/* Розподіл часу по методиках */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">
            <i className="fas fa-chart-pie"></i>
            {t('statistics.charts.methodsDistribution', 'Розподіл часу по методиках')}
          </h3>
        </div>
        <div className="chart-content">
          {methodsData.length > 0 ? (
            <MethodsList data={methodsData} />
          ) : (
            <div className="chart-no-data">
              <i className="fas fa-chart-pie"></i>
              <p>{t('statistics.noData', 'Немає даних для відображення')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Активність по методиках */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">
            <i className="fas fa-list"></i>
            {t('statistics.charts.methodsActivity', 'Детальна активність')}
          </h3>
        </div>
        <div className="chart-content">
          {methodsData.length > 0 ? (
            <ActivityList data={methodsData} />
          ) : (
            <div className="chart-no-data">
              <i className="fas fa-list"></i>
              <p>{t('statistics.noData', 'Немає даних для відображення')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Аналіз продуктивності */}
      <div className="chart-container chart-full-width">
        <div className="chart-header">
          <h3 className="chart-title">
            <i className="fas fa-chart-line"></i>
            {t('statistics.charts.productivityAnalysis', 'Аналіз продуктивності')}
          </h3>
        </div>
        <div className="chart-content">
          <div className="productivity-analysis">
            <div className="productivity-item">
              <div className="productivity-label">Поточна продуктивність:</div>
              <div className="productivity-value current">
                {productivityPrediction.currentProductivity || 0}%
              </div>
            </div>
            <div className="productivity-item">
              <div className="productivity-label">Потенційна продуктивність:</div>
              <div className="productivity-value potential">
                {productivityPrediction.potentialProductivity || 0}%
              </div>
            </div>
            <div className="productivity-item">
              <div className="productivity-label">Можливе покращення:</div>
              <div className="productivity-value improvement">
                +{productivityPrediction.improvementPercentage || 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Рекомендації */}
      {productivityPrediction.recommendations?.length > 0 && (
        <div className="recommendations-section">
          <div className="recommendations-header">
            <h3 className="recommendations-title">
              <i className="fas fa-lightbulb"></i>
              {t('statistics.recommendations.title', 'Рекомендації для покращення')}
            </h3>
          </div>
          <div className="recommendations-grid">
            {productivityPrediction.recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-card">
                <div className="recommendation-icon">
                  <i className="fas fa-arrow-right"></i>
                </div>
                <div className="recommendation-text">
                  {recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default StatisticsCharts;