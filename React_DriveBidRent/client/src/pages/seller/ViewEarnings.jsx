import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';

const ViewEarnings = () => {
  const [totalAuctionEarnings, setTotalAuctionEarnings] = useState(0);
  const [totalRentalEarnings, setTotalRentalEarnings] = useState(0);
  const [recentEarnings, setRecentEarnings] = useState([]);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await axiosInstance.get('/seller/view-earnings');
        if (response.data.success) {
          const data = response.data.data;
          setTotalAuctionEarnings(data.totalAuctionEarnings);
          setTotalRentalEarnings(data.totalRentalEarnings);
          setRecentEarnings(data.recentEarnings);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEarnings();
  }, []);

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap");

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

        /* Seller Dashboard Content */
        .seller-dashboard {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .seller-dashboard h1 {
          color: #ff6b00;
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .dashboard-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .dashboard-card {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .dashboard-card h2 {
          color: #ff6b00;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .dashboard-card p {
          margin-bottom: 1.5rem;
          color: #666666;
        }

        .card-btn {
          display: inline-block;
          background: linear-gradient(135deg, #ff6b00, #ff9a44);
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.3s ease;
          margin: 0.5rem;
        }

        .card-btn:hover {
          background: linear-gradient(135deg, #ff9a44, #ff6b00);
        }

        /* Total Earnings Section */
        .total-earnings {
          display: flex;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .total-earnings-card {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
          flex: 1;
        }

        .total-earnings-card h2 {
          color: #ff6b00;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .total-earnings-card p {
          font-size: 1.8rem;
          font-weight: 600;
          color: #333333;
        }

        /* Earnings List Section */
        .earnings-list {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .earnings-list h2 {
          color: #ff6b00;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .earnings-list ul {
          list-style: none;
          padding: 0;
        }

        .earnings-list ul li {
          padding: 0.75rem 0;
          border-bottom: 1px solid #eee;
          font-size: 1.1rem;
          color: #333333;
        }

        .earnings-list ul li:last-child {
          border-bottom: none;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dashboard-cards {
            grid-template-columns: 1fr;
          }
          
          .total-earnings {
            flex-direction: column;
          }
        }
      `}</style>
      <section className="seller-dashboard">
        <h1>Your Earnings</h1>

        {/* Total Earnings Section */}
        <div className="total-earnings">
          <div className="total-earnings-card">
            <h2>Total Earnings from Auctions</h2>
            <p>₹{totalAuctionEarnings.toFixed(2)}</p>
          </div>
          <div className="total-earnings-card">
            <h2>Total Earnings from Rentals</h2>
            <p>₹{totalRentalEarnings.toFixed(2)}</p>
          </div>
        </div>

        {/* Individual Earnings List */}
        <div className="earnings-list">
          <h2>Recent Earnings</h2>
          {recentEarnings.length > 0 ? (
            <ul>
              {recentEarnings.map((earning, index) => (
                <li key={index}>
                  ₹{earning.amount.toFixed(2)} - {earning.description} 
                  ( {new Date(earning.createdAt).toLocaleDateString('en-US', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })} )
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent earnings available.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default ViewEarnings;