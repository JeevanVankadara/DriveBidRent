import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authServices } from '../../../services/auth.services';

const Navbar = ({ currentPage }) => {
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
    <>
      <style>{`
        /* Navigation Bar */
        .navbar {
          position: sticky;
          top: 0;
          background-color: #ffffff;
          padding: 1rem 0;
          box-shadow: 0 2px 20px rgba(255, 107, 0, 0.2);
          z-index: 1000;
        }
        
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
        }
        
        .logo a {
          color: #ff6b00;
          font-size: 1.8rem;
          font-weight: 700;
          text-decoration: none;
        }
        
        .nav-links {
          display: flex;
          gap: 2rem;
        }
        
        .nav-links a {
          color: #333333;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .nav-links a:hover,
        .nav-links a.active {
          border-bottom: 3px solid #ff6b00;
        }
        
        /* Loggout Button */
        .logout-btn {
            background-color: #ff6b00; /* Orange */
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-left: 0.5rem;
        }
        
        .logout-btn:hover {
            background-color: #e65c00; 
            transform: translateY(-1px);
        }
        
        .profile {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        .profile img {
          height: 40px;
          border-radius: 50%;
        }
        
        .profile-text {
          color: #ff6b00;
          text-decoration: none;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: color 0.3s ease;
        }
        
        .profile-text:hover {
          color: #e65c00;
        }
        
        @media (max-width: 768px) {
          .nav-container {
            flex-direction: column;
            gap: 1rem;
          }
          
          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo"><Link to="/seller-dashboard">DriveBidRent</Link></div>
          <div className="nav-links">
            <Link to="/seller-dashboard" className={currentPage === 'dashboard' ? 'active' : ''}>Dashboard</Link>
            <Link to="/seller/add-auction" className={currentPage === 'add-auction' ? 'active' : ''}>Add Auction</Link>
            <Link to="/seller/add-rental" className={currentPage === 'add-rental' ? 'active' : ''}>Add Rental</Link>
            <Link to="/seller/view-earnings" className={currentPage === 'earnings' ? 'active' : ''}>Earnings</Link>
          </div>
          <div className="profile">
            <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="profile symbol" style={{height: '40px'}} />
            <Link to="/seller/profile" className="profile-text">My Profile</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;