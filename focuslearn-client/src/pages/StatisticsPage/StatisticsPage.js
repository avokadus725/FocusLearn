// src/pages/StatisticsPage/StatisticsPage.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/common/Layout';
import StatisticsCards from './components/StatisticsCards';
import StatisticsCharts from './components/StatisticsCharts';
import PeriodSelector from './components/PeriodSelector';
import { useStatistics } from '../../hooks/useStatistics';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './StatisticsPage.css';

const StatisticsPage = () => {
  const { t } = useTranslation();
  const {
    loading,
    error,
    selectedPeriod,
    userStatistics,
    methodStatistics,
    mostEffectiveMethod,
    productivityCoefficient,
    productivityPrediction,
    methods,
    handlePeriodChange,
    retryLoading
  } = useStatistics();

  if (loading) {
    return (
      <Layout>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">{t('common.loading', 'Завантаження...')}</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="statistics-error">
          <FontAwesomeIcon icon="exclamation-triangle" />
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={retryLoading}
          >
            {t('common.retry', 'Спробувати знову')}
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="statistics-page-layout">
      <div className="statistics-page">
        <div className="container container-xl px-4 py-8">
          
          {/* Заголовок */}
          <header className="text-center mb-8">
            <h1 className="heading-1 mb-2 flex items-center justify-center gap-4">
              <FontAwesomeIcon icon="chart-line" className="text-primary-500" />
              {t('statistics.title', 'Статистика продуктивності')}
            </h1>
            <p className="body-large text-gray-600">
              {t('statistics.subtitle', 'Аналіз вашої концентрації та продуктивності')}
            </p>
          </header>

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