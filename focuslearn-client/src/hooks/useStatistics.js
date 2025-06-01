// src/hooks/useStatistics.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import statisticsService from '../api/statisticsService';
import concentrationService from '../api/concentrationService';

export const useStatistics = () => {
  const { t } = useTranslation();
  
  // Основні стани
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

  // Утиліта для отримання початкової дати періоду
  const getPeriodStartDate = useCallback((period) => {
    const now = new Date();
    
    switch (period) {
      case 'day':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return today.toISOString().split('T')[0];
        
      case 'week':
        const currentDay = now.getDay(); 
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; 
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + mondayOffset);
        weekStart.setHours(0, 0, 0, 0);
        return weekStart.toISOString().split('T')[0];
        
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return monthStart.toISOString().split('T')[0];
        
      default:
        return new Date().toISOString().split('T')[0];
    }
  }, []);

  // Завантаження статистики
  const loadStatistics = useCallback(async (period = selectedPeriod) => {
    try {
      setLoading(true);
      setError(null);
      
      const periodStartDate = getPeriodStartDate(period);
      const results = {};
      
      // Завантаження користувацької статистики
      try {
        results.userStats = await statisticsService.getUserStatistics(periodStartDate, period);
      } catch (err) {
        console.error('Error loading user statistics:', err);
        results.userStats = { 
          totalConcentrationTime: 0, 
          breakCount: 0, 
          missedBreaks: 0 
        };
      }
      
      // Завантаження статистики методик
      try {
        results.methodStats = await statisticsService.getUserMethodStatistics();
      } catch (err) {
        console.error('Error loading method statistics:', err);
        results.methodStats = [];
      }
      
      // Завантаження найефективнішої методики
      try {
        results.effectiveMethod = await statisticsService.getMostEffectiveMethod(periodStartDate, period);
      } catch (err) {
        console.error('Error loading effective method:', err);
        results.effectiveMethod = { 
          message: t('statistics.noDataForAnalysis', 'Недостатньо даних для аналізу')
        };
      }
      
      // Завантаження коефіцієнта продуктивності
      try {
        results.prodCoefficient = await statisticsService.getProductivityCoefficient(periodStartDate, period);
      } catch (err) {
        console.error('Error loading productivity coefficient:', err);
        results.prodCoefficient = { productivityCoefficient: 0 };
      }
      
      // Завантаження прогнозу продуктивності
      try {
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
      
      // Завантаження списку методик
      try {
        results.methodsList = await concentrationService.getAllMethods();
      } catch (err) {
        console.error('Error loading methods list:', err);
        results.methodsList = [];
      }

      // Встановлення результатів
      setUserStatistics(results.userStats);
      setMethodStatistics(results.methodStats);
      setMostEffectiveMethod(results.effectiveMethod);
      setProductivityCoefficient(results.prodCoefficient);
      setProductivityPrediction(results.prodPrediction);
      setMethods(results.methodsList);
      
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError(t('statistics.errors.loadError', 'Помилка завантаження статистики'));
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, getPeriodStartDate, t]);

  // Обробник зміни періоду
  const handlePeriodChange = useCallback((period) => {
    setSelectedPeriod(period);
  }, []);

  // Перезавантаження статистики
  const retryLoading = useCallback(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Завантаження при зміні періоду
  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod, loadStatistics]);

  return {
    // Стани
    loading,
    error,
    selectedPeriod,
    
    // Дані
    userStatistics,
    methodStatistics,
    mostEffectiveMethod,
    productivityCoefficient,
    productivityPrediction,
    methods,
    
    // Дії
    handlePeriodChange,
    retryLoading,
    
    // Утиліти
    getPeriodStartDate
  };
};