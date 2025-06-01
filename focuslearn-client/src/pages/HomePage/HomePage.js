import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import AdminPanel from '../../components/admin/AdminPanel';
//import './HomePage.css';

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
        <section className="mb-12">
          <div className="card p-8 text-center bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <h1 className="text-4xl font-bold mb-4 tracking-tight">
              {t('welcome.title')}
            </h1>
            <p className="text-xl opacity-90 mb-6">
              {t('welcome.subtitle')}
            </p>
            
            {user && (
              <div className="bg-white bg-opacity-20 rounded-xl p-4 mt-6">
                <p className="text-lg font-medium">
                  {t('welcome.greeting', { name: user.userName || user.email })}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Швидкі дії */}
        <section className="mb-12">
          <h2 className="heading-2 text-center mb-8">
            {t('home.quickActions')}
          </h2>
          
          <div className="grid grid-cols-auto-md gap-6">
            <Link 
              to="/methods" 
              className="card card-interactive p-6 text-center hover:shadow-xl transition-all duration-300"
            >
              <div className="w-15 h-15 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <FontAwesomeIcon icon="clock" className="text-xl"/>
              </div>
              <h3 className="heading-4 mb-2">{t('features.focus.title')}</h3>
              <p className="body-small text-gray-600">{t('features.focus.description')}</p>
            </Link>
            
            <Link 
              to="/assignments" 
              className="card card-interactive p-6 text-center hover:shadow-xl transition-all duration-300"
            >
              <div className="w-15 h-15 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <FontAwesomeIcon icon="tasks" className="text-xl"/>
              </div>
              <h3 className="heading-4 mb-2">{t('features.tasks.title')}</h3>
              <p className="body-small text-gray-600">{t('features.tasks.description')}</p>
            </Link>
            
            <Link 
              to="/materials" 
              className="card card-interactive p-6 text-center hover:shadow-xl transition-all duration-300"
            >
              <div className="w-15 h-15 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <FontAwesomeIcon icon="book" className="text-xl"/>
              </div>
              <h3 className="heading-4 mb-2">{t('features.materials.title')}</h3>
              <p className="body-small text-gray-600">{t('features.materials.description')}</p>
            </Link>
            
            <Link 
              to="/statistics" 
              className="card card-interactive p-6 text-center hover:shadow-xl transition-all duration-300"
            >
              <div className="w-15 h-15 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <FontAwesomeIcon icon="chart-line" className="text-xl"/>
              </div>
              <h3 className="heading-4 mb-2">{t('features.analytics.title')}</h3>
              <p className="body-small text-gray-600">{t('features.analytics.description')}</p>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;