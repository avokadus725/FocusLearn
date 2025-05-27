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
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
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
    const baseEfficiency = Math.min(totalTime / 60, 100); // Базова ефективність на основі часу
    const penaltyForMissedBreaks = missedBreaks * 5; // Штраф за пропущені перерви
    return Math.max(0, baseEfficiency - penaltyForMissedBreaks);
  };

  // Підготовка даних для продуктивності
  const prepareProductivityData = () => {
    return [
      {
        name: 'Поточна',
        value: productivityPrediction.currentProductivity || 0,
        color: '#64748b'
      },
      {
        name: 'Потенційна',
        value: productivityPrediction.potentialProductivity || 0,
        color: '#10b981'
      }
    ];
  };

  const methodsData = prepareMethodsData();
  const productivityData = prepareProductivityData();

  // Кастомний tooltip для графіків
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="recharts-custom-tooltip">
          <p className="tooltip-label">{label}</p>
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

  // Кастомна легенда
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.05) return null; // Не показуємо лейбли для дуже маленьких сегментів
    
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

  return (
    <div className="statistics-charts">
      
      {/* Кругова діаграма розподілу часу */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">
            <i className="fas fa-chart-pie"></i>
            {t('statistics.charts.methodsDistribution', 'Розподіл часу по методиках')}
          </h3>
        </div>
        <div className="chart-content">
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
            <div className="chart-no-data">
              <i className="fas fa-chart-pie"></i>
              <p>{t('statistics.noData', 'Немає даних для відображення')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Стовпчаста діаграма активності */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">
            <i className="fas fa-chart-bar"></i>
            {t('statistics.charts.methodsActivity', 'Детальна активність')}
          </h3>
        </div>
        <div className="chart-content">
          {methodsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={methodsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="breakCount" 
                  name="Кількість перерв" 
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="missedBreaks" 
                  name="Пропущені перерви" 
                  fill="#dc2626"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-no-data">
              <i className="fas fa-chart-bar"></i>
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productivityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                fill="#10b981"
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
              <i className="fas fa-arrow-up"></i>
              <span>
                Потенціал покращення: {productivityPrediction.improvementPercentage || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ефективність методик */}
      {methodsData.length > 0 && (
        <div className="chart-container chart-full-width">
          <div className="chart-header">
            <h3 className="chart-title">
              <i className="fas fa-chart-area"></i>
              Ефективність методик
            </h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={methodsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#10b981" 
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