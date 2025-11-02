import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import axiosInstance from '../../utils/axiosInstance.util';

const ViewRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await axiosInstance.get('/seller/view-rentals');
        if (response.data.success) {
          setRentals(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to load rentals');
      }
    };
    fetchRentals();
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
          background-color: #f8f8f8;
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
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .dashboard-card {
          background-color: #ffffff;
          border-radius: 0.5rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .card-img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        .card-content {
          padding: 1rem;
        }

        .car-name {
          color: #333;
          font-size: 1.6rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .cost-info, .location-info {
          color: #666;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .card-buttons {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .details-btn, .update-btn {
          flex: 1;
          background-color: #ff6b00;
          color: white;
          padding: 0.75rem;
          border: none;
          border-radius: 0.3rem;
          text-decoration: none;
          font-weight: 500;
          text-align: center;
          transition: background 0.3s ease;
          font-size: 0.9rem;
        }

        .update-btn {
          background-color: #4c6fff;
        }

        .details-btn:hover {
          background-color: #ff8c3f;
        }

        .update-btn:hover {
          background-color: #6a86ff;
        }

        .no-rentals {
          text-align: center;
          padding: 2rem;
          background-color: #ffffff;
          border-radius: 0.5rem;
          margin: 2rem auto;
          max-width: 800px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .error-message {
          color: #ff0000;
          text-align: center;
          padding: 1rem;
          background-color: #ffeeee;
          border-radius: 0.5rem;
          margin-bottom: 2rem;
        }

        /* Responsive Design */
        @media (max-width: 992px) {
          .dashboard-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <Navbar currentPage="view-rentals" />
      <section className="seller-dashboard">
        <h1>Rental Vehicles</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {rentals.length > 0 ? (
          <div className="dashboard-cards" id="rental-listings">
            {rentals.map(rental => (
              <div key={rental._id} className="dashboard-card" data-id={rental._id}>
                <img src={rental.vehicleImage} alt={rental.vehicleName} className="card-img" />
                <div className="card-content">
                  <h2 className="car-name">{rental.vehicleName}</h2>
                  <p className="cost-info">Cost/day: ₹{rental.costPerDay}</p>
                  <p className="location-info">Location: {rental.location}</p>
                  
                  <div className="card-buttons">
                    <Link to={`/seller/rental-details/${rental._id}`} className="details-btn">More Details</Link>
                    <Link to={`/seller/update-rental/${rental._id}`} className="update-btn">Update</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-rentals">
            <h2>You don't have any rental listings yet</h2>
            <p>Add your first vehicle for rent to get started!</p>
            <Link to="/seller/add-rental" className="details-btn" style={{display: 'inline-block', marginTop: '1rem', maxWidth: '200px'}}>Add Rental</Link>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
};

export default ViewRentals;