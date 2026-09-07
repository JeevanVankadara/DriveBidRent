// client/src/pages/seller/SellerLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from '../../components/hub/HubFooter';
import axiosInstance from '../../utils/axiosInstance.util';
import '../../styles/HubTheme.css';
import '../../styles/HubDashboards.css';

const SellerLayout = () => {
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try a protected API call
        await axiosInstance.get('/seller/profile');
        // If success → user is logged in
      } catch (err) {
        // 401 or any error → token invalid/expired
        if (err.response?.status === 401 || !err.response) {
          setShowLoginMessage(true);
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        }
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="seller-layout flex flex-col min-h-screen">
      <Navbar />

      {/* Login Message */}
      {showLoginMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="hub-surface-card p-6 text-center max-w-sm w-full">
            <p className="text-lg font-medium hub-text-primary">
              Please login to continue
            </p>
          </div>
        </div>
      )}

      <main className="flex-grow relative" style={{ zIndex: 1 }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default SellerLayout;
