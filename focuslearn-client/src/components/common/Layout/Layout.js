import React from 'react';
import Navbar from '../Navbar';
import './Layout.css';

const Layout = ({ children, className = '' }) => {
  return (
    <div className={`layout ${className}`}>
      <Navbar />
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;