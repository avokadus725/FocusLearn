// src/pages/StatisticsPage/components/StatisticsCharts.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import './StatisticsCharts.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StatisticsCharts = ({ 
  methodStatistics, 
  userStatistics, 
  methods, 
  selectedPeriod,
  productivityPrediction 
}) => {
  const { t } = useTranslation();

  // Кольори для графіків у стилі додатка
  const colors = [
    'var(--color-primary-500)', 
    'var(--color-primary-600)', 
    'var(--color-success-500)', 
    'var(--color-warning-500)', 
    'var(--color-info-500)', 
    'var(--color-secondary-500)'
  ];
  
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
          existing.missedBreaks += stat.missedBreaks;
        } else {
          methodsMap.set(key, {
            methodId: stat.methodId,
            name: getMethodName(stat.methodId),
            totalTime: stat.totalConcentrationTime,
            breakCount: stat.breakCount,
            missedBreaks: stat.missedBreaks,
            efficiency: calculateEfficiency(stat.totalConcentrationTime, stat.missedBreaks)
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

  // Розрахунок ефективності
  const calculateEfficiency = (totalTime, missedBreaks) => {
    if (totalTime === 0) return 0;
    const baseEfficiency = Math.min(totalTime / 60, 100);
    const penaltyForMissedBreaks = missedBreaks * 5;
    return Math.max(0, baseEfficiency - penaltyForMissedBreaks);
  };

  // Підготовка даних для продуктивності
  const prepareProductivityData = () => {
    return [
      {
        name: 'Поточна',
        value: productivityPrediction.currentProductivity || 0,
        color: 'var(--color-gray-500)'
      },
      {
        name: 'Потенційна',
        value: productivityPrediction.potentialProductivity || 0,
        color: 'var(--color-primary-500)'
      }
    ];
  };

  const methodsData = prepareMethodsData();
  const productivityData = prepareProductivityData();

  // Кастомний tooltip для графіків
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes('час') ? 'хв' : entry.name.includes('Продуктивність') ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Кастомна легенда для pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Компонент для відсутності даних
  const NoDataMessage = ({ icon, message }) => (
    <div className="chart-no-data">
      <FontAwesomeIcon icon={icon} />
      <p>{message || t('statistics.noData', 'Немає даних для відображення')}</p>
    </div>
  );

  return (
    <div className="statistics-charts">
      
      {/* Кругова діаграма розподілу часу */}
      <div className="card chart-container">
        <div className="card-body">
          
          {/* Заголовок */}
          <h3 className="heading-4 chart-title mb-6 pb-4" style={{borderBottom: '1px solid var(--color-gray-200)'}}>
            <FontAwesomeIcon icon="chart-pie" />
            {t('statistics.charts.methodsDistribution', 'Розподіл часу по методиках')}
          </h3>
          
          {methodsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={methodsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="totalTime"
                >
                  {methodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontWeight: 500 }}>
                      {value} ({entry.payload.totalTime}хв)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage icon="chart-pie" />
          )}
        </div>
      </div>

      {/* Стовпчаста діаграма активності */}
      <div className="card chart-container">
        <div className="card-body">
          
          {/* Заголовок */}
          <h3 className="heading-4 chart-title mb-6 pb-4" style={{borderBottom: '1px solid var(--color-gray-200)'}}>
            <FontAwesomeIcon icon="chart-bar" />
            {t('statistics.charts.methodsActivity', 'Детальна активність')}
          </h3>
          
          {methodsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={methodsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="totalTime" 
                  name="Час концентрації (хв)" 
                  fill="var(--color-primary-500)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="breakCount" 
                  name="Кількість перерв" 
                  fill="var(--color-success-500)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="missedBreaks" 
                  name="Пропущені перерви" 
                  fill="var(--color-danger-500)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage icon="chart-bar" />
          )}
        </div>
      </div>

      {/* Аналіз продуктивності */}
      <div className="card chart-container chart-full-width">
        <div className="card-body">
          
          {/* Заголовок */}
          <h3 className="heading-4 chart-title mb-6 pb-4" style={{borderBottom: '1px solid var(--color-gray-200)'}}>
            <FontAwesomeIcon icon="chart-line" />
            {t('statistics.charts.productivityAnalysis', 'Аналіз продуктивності')}
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productivityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
              <XAxis dataKey="name" tick={{ fontSize: 14, fontWeight: 500 }} />
              <YAxis 
                tick={{ fontSize: 12 }} 
                domain={[0, 100]}
                label={{ value: 'Продуктивність (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Продуктивність']}
                labelStyle={{ fontWeight: 600 }}
              />
              <Bar 
                dataKey="value" 
                fill="var(--color-primary-500)"
                radius={[8, 8, 0, 0]}
              >
                {productivityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {/* Додаткова інформація */}
          <div className="productivity-summary">
            <div className="productivity-improvement">
              <FontAwesomeIcon icon="arrow-up" />
              <span>
                Потенціал покращення: {productivityPrediction.improvementPercentage || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ефективність методик */}
      {methodsData.length > 0 && (
        <div className="card chart-container chart-full-width">
          <div className="card-body">
            
            {/* Заголовок */}
            <h3 className="heading-4 chart-title mb-6 pb-4" style={{borderBottom: '1px solid var(--color-gray-200)'}}>
              <FontAwesomeIcon icon="chart-area"/>
              {t('statistics.cards.productivityDesc')}
            </h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={methodsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="var(--color-primary-500)" 
                  fillOpacity={1} 
                  fill="url(#colorEfficiency)"
                  name="Ефективність"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Рекомендації */}
      {productivityPrediction.recommendations?.length > 0 && (
        <div className="card recommendations-section">
          <div className="card-body">
            <h3 className="heading-3 mb-6 pb-4" style={{borderBottom: '1px solid var(--color-gray-200)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)'}}>
              <FontAwesomeIcon icon="lightbulb" style={{color: 'var(--color-warning-500)'}}/>
              {t('statistics.recommendations.title', 'Рекомендації для покращення')}
            </h3>
            
            <div className="recommendations-grid">
              {productivityPrediction.recommendations.map((recommendation, index) => (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-icon">
                    <FontAwesomeIcon icon="arrow-right"/>
                  </div>
                  <div className="recommendation-text">
                    {recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default StatisticsCharts;