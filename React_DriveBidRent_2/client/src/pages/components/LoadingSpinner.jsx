import React from 'react';

const LoadingSpinner = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      // transparent so the surrounding layout's background shows through
      // (cream in the buyer section, page default elsewhere)
      backgroundColor: 'transparent'
    }}>
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #ff6b00',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;