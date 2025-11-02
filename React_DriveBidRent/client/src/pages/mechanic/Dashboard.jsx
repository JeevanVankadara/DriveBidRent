import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authServices } from '../../services/auth.services';

const MechanicDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authServices.logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Welcome to Mechanic Dashboard</h1>
      <p>Mechanic-specific content will go here.</p>
      <button onClick={handleLogout} style={{ padding: '10px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '5px' }}>
        Logout
      </button>
    </div>
  );
};

export default MechanicDashboard;