import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/common/Layout';
import StatisticsCards from './components/StatisticsCards';
import StatisticsCharts from './components/StatisticsCharts';
import PeriodSelector from './components/PeriodSelector';
import statisticsService from '../../api/statisticsService';
import concentrationService from '../../api/concentrationService';
import './StatisticsPage.css';

const StatisticsPage = () => {
  const { t } = useTranslation();
  
  // Стани для даних
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  
  // Дані статистики
  const [userStatistics, setUserStatistics] = useState({});
  const [methodStatistics, setMethodStatistics] = useState([]);
  const [mostEffectiveMethod, setMostEffectiveMethod] = useState({});
  const [productivityCoefficient, setProductivityCoefficient] = useState({});
  const [productivityPrediction, setProductivityPrediction] = useState({});
  const [methods, setMethods] = useState([]);

  // Отримати дату початку періоду
  const getPeriodStartDate = (period) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'day':
        return today.toISOString().split('T')[0];
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return weekStart.toISOString().split('T')[0];
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return monthStart.toISOString().split('T')[0];
      default:
        return today.toISOString().split('T')[0];
    }
  };

  // Завантаження даних
  const loadStatistics = async (period = selectedPeriod) => {
    try {
      setLoading(true);
      setError(null);
      
      const periodStartDate = getPeriodStartDate(period);
      
      console.log('Loading statistics for period:', period, 'date:', periodStartDate);
      
      // Завантажуємо дані послідовно, щоб легше відслідковувати помилки
      const results = {};
      
      try {
        console.log('Loading user statistics...');
        results.userStats = await statisticsService.getUserStatistics(periodStartDate, period);
      } catch (err) {
        console.error('Error loading user statistics:', err);
        results.userStats = { totalConcentrationTime: 0, breakCount: 0, missedBreaks: 0 };
      }
      
      try {
        console.log('Loading method statistics...');
        results.methodStats = await statisticsService.getUserMethodStatistics();
      } catch (err) {
        console.error('Error loading method statistics:', err);
        results.methodStats = [];
      }
      
      try {
        console.log('Loading effective method...');
        results.effectiveMethod = await statisticsService.getMostEffectiveMethod(periodStartDate, period);
      } catch (err) {
        console.error('Error loading effective method:', err);
        results.effectiveMethod = { message: 'Недостатньо даних для аналізу' };
      }
      
      try {
        console.log('Loading productivity coefficient...');
        results.prodCoefficient = await statisticsService.getProductivityCoefficient(periodStartDate, period);
      } catch (err) {
        console.error('Error loading productivity coefficient:', err);
        results.prodCoefficient = { productivityCoefficient: 0 };
      }
      
      try {
        console.log('Loading productivity prediction...');
        results.prodPrediction = await statisticsService.getPredictProductivity(periodStartDate, period);
      } catch (err) {
        console.error('Error loading productivity prediction:', err);
        results.prodPrediction = { 
          currentProductivity: 0, 
          potentialProductivity: 0, 
          improvementPercentage: 0,
          recommendations: []
        };
      }
      
      try {
        console.log('Loading methods list...');
        results.methodsList = await concentrationService.getAllMethods();
      } catch (err) {
        console.error('Error loading methods list:', err);
        results.methodsList = [];
      }

      // Встановлюємо результати
      setUserStatistics(results.userStats);
      setMethodStatistics(results.methodStats);
      setMostEffectiveMethod(results.effectiveMethod);
      setProductivityCoefficient(results.prodCoefficient);
      setProductivityPrediction(results.prodPrediction);
      setMethods(results.methodsList);
      
      console.log('Statistics loaded successfully');
      
    } catch (err) {
      console.error('Critical error loading statistics:', err);
      setError(t('statistics.errors.loadError', 'Помилка завантаження статистики'));
    } finally {
      setLoading(false);
    }
  };

  // Завантаження при mount та зміні періоду
  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  // Обробник зміни періоду
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  if (loading) {
    return (
      <Layout>
        <div className="statistics-loading">
          <i className="fas fa-spinner fa-spin" style={{fontSize: '2rem', color: '#10b981'}}></i>
          <p>{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="statistics-error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button 
            className="statistics-retry-btn"
            onClick={() => loadStatistics()}
          >
            {t('common.retry')}
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="statistics-page-layout">
      <div className="statistics-page">
        <div className="statistics-container">
          
          {/* Заголовок */}
          <div className="statistics-header">
            <h1 className="statistics-title">
              <i className="fas fa-chart-line"></i>
              {t('statistics.title', 'Статистика продуктивності')}
            </h1>
            <p className="statistics-subtitle">
              {t('statistics.subtitle', 'Аналіз вашої концентрації та продуктивності')}
            </p>
          </div>

          {/* Селектор періоду */}
          <PeriodSelector 
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            loading={loading}
          />

          {/* Картки статистики */}
          <StatisticsCards 
            userStatistics={userStatistics}
            mostEffectiveMethod={mostEffectiveMethod}
            productivityCoefficient={productivityCoefficient}
            productivityPrediction={productivityPrediction}
            selectedPeriod={selectedPeriod}
          />

          {/* Графіки та діаграми */}
          <StatisticsCharts 
            methodStatistics={methodStatistics}
            userStatistics={userStatistics}
            methods={methods}
            selectedPeriod={selectedPeriod}
            productivityPrediction={productivityPrediction}
          />
          
        </div>
      </div>
    </Layout>
  );
};

export default StatisticsPage;