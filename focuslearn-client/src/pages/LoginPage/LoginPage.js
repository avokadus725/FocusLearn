import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithFacebook, error: authError, isAuthenticated, loading: authLoading } = useAuth();
  const { currentLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    console.log('LoginPage: isAuthenticated =', isAuthenticated, 'authLoading =', authLoading);
    
    if (!authLoading && isAuthenticated) {
      console.log('User is authenticated, redirecting to home...');
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Перевірка авторизації...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Перенаправлення...</p>
      </div>
    );
  }

  // Стандартні тексти для сторінки входу
  const [texts] = useState({
    welcomeToFocusLearn: 'Welcome to FocusLearn',
    optimizeYourLearning: 'Optimize your learning process',
    description: 'Log in to track your focus sessions, manage your assignments, and improve your productivity.',
    continueWithGoogle: 'Continue with Google',
    continueWithFacebook: 'Continue with Facebook',
    byLoggingIn: 'By logging in, you agree to our',
    privacyPolicy: 'Privacy Policy',
    and: 'and',
    termsOfService: 'Terms of Service'
  });
 
  // Обробники для авторизації
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
    } catch (err) {
      setError('Failed to login with Google. Please try again later.');
      console.error('Google login error:', err);
      setLoading(false);
    }
  };
 
  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithFacebook();
      // The page will redirect, code below won't run
    } catch (err) {
      setError('Failed to login with Facebook. Please try again later.');
      console.error('Facebook login error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{texts.welcomeToFocusLearn}</h1>
          <p className="login-tagline">{texts.optimizeYourLearning}</p>
        </div>
        <div className="login-content">
          <p className="login-description">
            {texts.description}
          </p>
          {(error || authError) && (
            <div className="alert alert-danger">
              {error || authError}
            </div>
          )}
          <div className="login-buttons">
            <button
              className="btn btn-login btn-google"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <span><FontAwesomeIcon icon="spinner" spin /> Loading...</span>
              ) : (
                <span>{texts.continueWithGoogle}</span>
              )}
            </button>
           
            <button
              className="btn btn-login btn-facebook"
              onClick={handleFacebookLogin}
              disabled={loading}
            >
              {loading ? (
                <span><FontAwesomeIcon icon="spinner" spin /> Loading...</span>
              ) : (
                <span>{texts.continueWithFacebook}</span>
              )}
            </button>
          </div>
        </div>
        <div className="login-footer">
          <p>
            {texts.byLoggingIn} <a href="/privacy-policy">{texts.privacyPolicy}</a> {texts.and} <a href="/terms-of-service">{texts.termsOfService}</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;