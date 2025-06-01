import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import AdminPanel from '../../components/admin/AdminPanel';

const HomePage = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">{t('common.loading')}</p>
      </div>
    );
  }

  if (user?.role === 'Admin') {
    return (
      <Layout>
        <AdminPanel />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-xl mx-auto px-4 py-8">
        
        {/* Привітальна секція */}
        <section className="section">
          <div className="welcome-hero">
            <h1 className="heading-1 mb-4" style={{ color: 'white' }}>
              {t('welcome.title')}
            </h1>
            <p className="text-xl mb-6 opacity-90">
              {t('welcome.subtitle')}
            </p>
            
            {user && (
              <div className="welcome-greeting">
                <p className="text-lg font-medium mb-0">
                  {t('welcome.greeting', { name: user.userName || user.email })}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Швидкі дії */}
        <section className="section">
          <h2 className="section-title" style={{ justifyContent: 'center' }}>
            {t('home.quickActions')}
          </h2>
          
          <div className="grid grid-cols-auto-md gap-6">
            
            {/* Методи фокусування */}
            <Link 
              to="/methods" 
              className="card card-interactive"
            >
              <div className="card-body text-center">
                <div className="card-icon card-icon-primary card-icon-lg mb-4">
                  <FontAwesomeIcon icon="clock" />
                </div>
                <h3 className="heading-4 mb-2">{t('features.focus.title')}</h3>
                <p className="body-small text-gray-600">{t('features.focus.description')}</p>
              </div>
            </Link>
            
            {/* Завдання */}
            <Link 
              to="/assignments" 
              className="card card-interactive"
            >
              <div className="card-body text-center">
                <div className="card-icon card-icon-primary card-icon-lg mb-4">
                  <FontAwesomeIcon icon="tasks" />
                </div>
                <h3 className="heading-4 mb-2">{t('features.tasks.title')}</h3>
                <p className="body-small text-gray-600">{t('features.tasks.description')}</p>
              </div>
            </Link>
            
            {/* Матеріали */}
            <Link 
              to="/materials" 
              className="card card-interactive"
            >
              <div className="card-body text-center">
                <div className="card-icon card-icon-primary card-icon-lg mb-4">
                  <FontAwesomeIcon icon="book" />
                </div>
                <h3 className="heading-4 mb-2">{t('features.materials.title')}</h3>
                <p className="body-small text-gray-600">{t('features.materials.description')}</p>
              </div>
            </Link>
            
            {/* Статистика */}
            <Link 
              to="/statistics" 
              className="card card-interactive"
            >
              <div className="card-body text-center">
                <div className="card-icon card-icon-primary card-icon-lg mb-4">
                  <FontAwesomeIcon icon="chart-line" />
                </div>
                <h3 className="heading-4 mb-2">{t('features.analytics.title')}</h3>
                <p className="body-small text-gray-600">{t('features.analytics.description')}</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;