import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import axiosInstance from '../../utils/axiosInstance.util';

const Profile = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    doorNo: '',
    street: '',
    city: '',
    state: '',
    notificationPreference: 'all'
  });
  const [auctionsCount, setAuctionsCount] = useState(0);
  const [rentalsCount, setRentalsCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get('/seller/profile');
        if (response.data.success) {
          setUser(response.data.data);
        }
        // Fetch listings, earnings separately if needed
        const earningsResponse = await axiosInstance.get('/seller/view-earnings');
        if (earningsResponse.data.success) {
          const { totalRentalEarnings, totalAuctionEarnings, recentEarnings } = earningsResponse.data.data;
          setTotalEarnings(totalRentalEarnings + totalAuctionEarnings);
          setRecentTransactions(recentEarnings);
        }
        // Assume auctionsCount, rentalsCount fetched from /seller/view-auctions and /seller/view-rentals summary
      } catch (err) {
        setError('Failed to load profile data');
      }
    };
    fetchProfileData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/seller/update-profile', user);
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handlePreferencesChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/seller/update-preferences', { notificationPreference: user.notificationPreference });
      if (response.data.success) {
        setSuccess('Preferences updated successfully!');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to update preferences');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    // Implement password change logic similarly
  };

  return (
    <>
      <style>{`
        /* Seller Profile Page Styles */
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Montserrat", sans-serif;
        }

        body {
          background-color: #ffffff;
          color: #333333;
        }

        .seller-profile-content {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .seller-profile-content h1 {
          color: #ff6b00;
          font-size: 2.5rem;
          margin-bottom: 2rem;
        }

        .profile-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .seller-info, .listings-overview, .earnings-summary, .preferences {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .seller-info h2, .listings-overview h2, .earnings-summary h2, .preferences h2 {
          color: #ff6b00;
          margin-bottom: 1.5rem;
        }

        form label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333333;
        }

        form input, form select, form textarea {
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 0.3rem;
        }

        form input:read-only {
          background-color: #f9f9f9;
          color: #666666;
          cursor: not-allowed;
        }

        .save-btn {
          background: linear-gradient(135deg, #ff6b00, #ff9a44);
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.3rem;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .save-btn:hover {
          background: linear-gradient(135deg, #ff9a44, #ff6b00);
        }

        .listings-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .summary-card {
          background-color: #f9f9f9;
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
        }

        .summary-card h3 {
          color: #ff6b00;
          margin-bottom: 0.5rem;
        }

        .summary-card p {
          margin-bottom: 1rem;
          color: #666666;
        }

        .details-btn {
          display: inline-block;
          background: linear-gradient(135deg, #ff6b00, #ff9a44);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.3rem;
          text-decoration: none;
          transition: background 0.3s ease;
        }

        .details-btn:hover {
          background: linear-gradient(135deg, #ff9a44, #ff6b00);
        }

        .earnings-card {
          background-color: #f9f9f9;
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .earnings-card p {
          margin-bottom: 0.5rem;
          color: #666666;
        }

        .earnings-card ul {
          list-style: none;
          margin-bottom: 1rem;
        }

        .earnings-card ul li {
          margin-bottom: 0.5rem;
          color: #333333;
        }

        /* Password Fields */
        #old-password, #new-password, #confirm-password {
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 0.3rem;
        }

        /* Alert Messages */
        .alert {
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 15px;
        }

        .alert-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-danger {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        /* Error Messages */
        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: -0.75rem;
          margin-bottom: 0.75rem;
          display: none;
        }

        /* Address Fields Layout */
        .address-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .address-full-width {
          grid-column: 1 / -1;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .profile-container {
            grid-template-columns: 1fr;
          }
          
          .address-fields {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <Navbar currentPage="profile" />
      <section className="seller-profile-content">
        <h1>Seller Profile</h1>
        
        {success && <div className="alert alert-success">{success}</div>}
        
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="profile-container">
          {/* Seller Information Section */}
          <div className="seller-info">
            <h2>Personal Information</h2>
            <div id="profileUpdateAlert" className="alert alert-success" style={{display: 'none'}}></div>
            <div id="profileUpdateError" className="alert alert-danger" style={{display: 'none'}}></div>
            <form id="seller-profile-form" onSubmit={handleProfileSubmit}>
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={user.firstName}
                onChange={handleProfileChange}
                required
              />
              <div id="firstName-error" className="error-message">First name is required and should be at least 2 characters.</div>

              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={user.lastName}
                onChange={handleProfileChange}
                required
              />

              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={user.email}
                readOnly
              />

              <label htmlFor="phone">Phone Number:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={user.phone || ''}
                onChange={handleProfileChange}
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
                required
              />
              <div id="phone-error" className="error-message">Please enter a valid 10-digit phone number.</div>

              <h3 style={{color: '#ff6b00', margin: '1.5rem 0 1rem 0'}}>Address Information</h3>
              
              <div className="address-fields">
                <div>
                  <label htmlFor="doorNo">Door/Flat No:</label>
                  <input
                    type="text"
                    id="doorNo"
                    name="doorNo"
                    value={user.doorNo || ''}
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="address-full-width">
                  <label htmlFor="street">Street/Area:</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={user.street || ''}
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="city">City:</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={user.city || ''}
                    onChange={handleProfileChange}
                    readOnly
                  />
                </div>
                
                <div>
                  <label htmlFor="state">State:</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={user.state || ''}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <button type="submit" className="save-btn">Save Changes</button>
            </form>
          </div>

          {/* Listings Overview Section */}
          <div className="listings-overview">
            <h2>Listings Overview</h2>
            <div className="listings-summary">
              <div className="summary-card">
                <h3>Active Auctions</h3>
                <p><strong>Total:</strong> {auctionsCount}</p>
                <a href="/seller/view-auctions" className="details-btn">View Auctions</a>
              </div>
              <div className="summary-card">
                <h3>Active Rentals</h3>
                <p><strong>Total:</strong> {rentalsCount}</p>
                <a href="/seller/view-rentals" className="details-btn">View Rentals</a>
              </div>
            </div>
          </div>

          {/* Earnings Summary Section */}
          <div className="earnings-summary">
            <h2>Earnings Summary</h2>
            <div className="earnings-card">
              <p><strong>Total Earnings:</strong> ₹{totalEarnings.toLocaleString('en-IN')}</p>
              <p><strong>Recent Transactions (Completed):</strong></p>
              {recentTransactions.length > 0 ? (
                <ul>
                  {recentTransactions.map((transaction, index) => (
                    <li key={index}>
                      ₹{transaction.amount.toLocaleString('en-IN')} - {transaction.description} 
                      ( {new Date(transaction.createdAt).toLocaleDateString('en-US', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })} )
                    </li>
                  ))}
                </ul>
              ) : (
                <ul>
                  <li>No recent completed transactions</li>
                </ul>
              )}
              <a href="/seller/view-earnings" className="details-btn">View All Earnings</a>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="preferences">
            <h2>Preferences</h2>
            <div id="preferencesUpdateAlert" className="alert alert-success" style={{display: 'none'}}></div>
            <div id="preferencesUpdateError" className="alert alert-danger" style={{display: 'none'}}></div>
            <form id="preferences-form" onSubmit={handlePreferencesSubmit}>
              <label htmlFor="notifications">Notification Preferences:</label>
              <select id="notifications" name="notifications" value={user.notificationPreference} onChange={handlePreferencesChange}>
                <option value="all">All Notifications</option>
                <option value="important">Only Important</option>
                <option value="none">None</option>
              </select>
              <div id="notifications-error" className="error-message">Please select a notification preference.</div>

              <h3 style={{marginTop: '20px', color: '#ff6b00'}}>Change Password</h3>
              <label htmlFor="old-password">Old Password:</label>
              <input
                type="password"
                id="old-password"
                name="oldPassword"
                placeholder="Enter Old Password"
              />
              <div id="old-password-error" className="error-message">Old password is required to change password.</div>

              <label htmlFor="new-password">New Password:</label>
              <input
                type="password"
                id="new-password"
                name="newPassword"
                placeholder="Enter New Password"
              />
              <div id="new-password-error" className="error-message">Password must be at least 8 characters, include uppercase, lowercase, numbers, and special characters (e.g., !@#$%).</div>

              <label htmlFor="confirm-password">Confirm New Password:</label>
              <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                placeholder="Confirm New Password"
              />
              <div id="confirm-password-error" className="error-message">Passwords do not match or confirmation is required.</div>

              <button type="submit" className="save-btn">Save Preferences</button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Profile;