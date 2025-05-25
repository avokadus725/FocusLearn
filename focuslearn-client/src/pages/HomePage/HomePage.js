import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import './HomePage.css';

const HomePage = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="home-main">
        {/* Привітальна секція */}
        <section className="welcome-section">
          <div className="welcome-hero">
            <h1 className="welcome-title">{t('welcome.title')}</h1>
            <p className="welcome-subtitle">{t('welcome.subtitle')}</p>
            
            {user && (
              <div className="welcome-greeting">
                <p>{t('welcome.greeting', { name: user.userName || user.email })}</p>
              </div>
            )}
          </div>
        </section>

        {/* Швидкі дії */}
        <section className="quick-actions-section">
          <h2 className="section-title">{t('home.quickActions')}</h2>
          <div className="quick-actions-grid">
            <Link to="/methods" className="action-card">
              <div className="action-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>{t('features.focus.title')}</h3>
              <p>{t('features.focus.description')}</p>
            </Link>
            
            <Link to="/assignments" className="action-card">
              <div className="action-icon">
                <i className="fas fa-tasks"></i>
              </div>
              <h3>{t('features.tasks.title')}</h3>
              <p>{t('features.tasks.description')}</p>
            </Link>
            
            <Link to="/materials" className="action-card">
              <div className="action-icon">
                <i className="fas fa-book"></i>
              </div>
              <h3>{t('features.notes.title')}</h3>
              <p>{t('features.notes.description')}</p>
            </Link>
            
            <Link to="/statistics" className="action-card">
              <div className="action-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>{t('features.analytics.title')}</h3>
              <p>{t('features.analytics.description')}</p>
            </Link>
          </div>
        </section>

        {/* Огляд функцій */}
        {/* <section className="features-section">
          <h2 className="section-title">{t('home.featuresOverview')}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3>{t('features.focus.title')}</h3>
              <p>{t('features.focus.description')}</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3>{t('features.analytics.title')}</h3>
              <p>{t('features.analytics.description')}</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-target"></i>
              </div>
              <h3>{t('features.goals.title')}</h3>
              <p>{t('features.goals.description')}</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <h3>{t('features.achievements.title')}</h3>
              <p>{t('features.achievements.description')}</p>
            </div>
          </div>
        </section> */}
      </div>
    </Layout>
  );
};

export default HomePage;