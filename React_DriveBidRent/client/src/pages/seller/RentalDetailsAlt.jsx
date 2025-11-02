import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';

const RentalDetailsAlt = () => {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [moneyReceived, setMoneyReceived] = useState(null);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const response = await axiosInstance.get(`/seller/rental-details/${id}`);
        if (response.data.success) {
          setRental(response.data.data.rental);
          setMoneyReceived(response.data.data.moneyReceived);
          if (response.data.data.rental.status === 'unavailable') {
            setShowPopup(true);
          }
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to load rental details');
      }
    };
    fetchRental();
  }, [id]);

  const closePopup = () => {
    setShowPopup(false);
  };

  if (error) {
    return (
        <div className="no-rentals">
        <h2>Rental details not found</h2>
        <Link to="/seller/view-rentals" className="back-button">Back to Rentals</Link>
      </div>
    );
  }

  if (!rental) {
    return <div>Loading...</div>;
  }

  const formattedPickupDate = rental.pickupDate ? new Date(rental.pickupDate).toISOString().split('T')[0] : 'Not specified';
  const formattedDropDate = rental.dropDate ? new Date(rental.dropDate).toISOString().split('T')[0] : 'Not specified';

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

        /* Rental Details Container */
        .rental-details-container {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .rental-title {
          width: 100%;
          color: #ff6b00;
          font-size: 2.5rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        /* Image Section */
        .image-section {
          flex: 1;
          min-width: 300px;
        }

        .rental-image {
          width: 100%;
          height: auto;
          border-radius: 0.5rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .basic-info {
          margin-top: 1.5rem;
          background: white;
          padding: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .basic-info h3 {
          color: #333;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .cost-info, .location-info {
          color: #666;
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }

        /* Rental Info (Buyer Details, Dates, Money Received) */
        .rental-info {
          margin-top: 1.5rem;
          background: white;
          padding: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .rental-info h3 {
          color: #333;
          font-size: 1.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid #ddd;
          padding-bottom: 0.5rem;
        }

        .rental-info p {
          color: #666;
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }

        .rental-info p strong {
          color: #333;
        }

        /* Details Section */
        .details-section {
          flex: 1;
          min-width: 300px;
          background: white;
          padding: 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .details-section h2 {
          color: #333;
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #ff6b00;
          padding-bottom: 0.5rem;
        }

        .detail-item {
          margin-bottom: 1rem;
        }

        .detail-label {
          font-weight: 600;
          color: #555;
          display: block;
          margin-bottom: 0.25rem;
        }

        .detail-value {
          color: #333;
          font-size: 1.1rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-weight: 500;
          font-size: 0.9rem;
          margin-left: 0.5rem;
        }

        .status-available {
          background-color: #e6f7e6;
          color: #2e7d32;
        }

        .status-unavailable {
          background-color: #ffebee;
          color: #c62828;
        }

        .back-button {
          display: inline-block;
          margin-top: 2rem;
          background-color: #ff6b00;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.3rem;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.3s ease;
        }

        .back-button:hover {
          background-color: #ff8c3f;
        }

        /* Popup Styling */
        .popup-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          justify-content: center;
          align-items: center;
        }

        .popup-content {
          background-color: white;
          padding: 2rem;
          border-radius: 0.5rem;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          max-width: 400px;
          width: 90%;
        }

        .popup-content h2 {
          color: #ff6b00;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .popup-content p {
          color: #333;
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }

        .popup-content button {
          background-color: #ff6b00;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.3rem;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.3s ease;
        }

        .popup-content button:hover {
          background-color: #ff8c3f;
        }

        @media (max-width: 768px) {
          .rental-details-container {
            flex-direction: column;
          }
        }
      `}</style>
      <div className="popup-overlay" style={{display: showPopup ? 'flex' : 'none'}}>
        <div className="popup-content">
          <h2>Rental Status</h2>
          <p>This car has been taken by someone for rental.</p>
          <button onClick={closePopup}>Close</button>
        </div>
      </div>
      <section className="rental-details-container">
        <h1 className="rental-title">Rental Vehicle Details</h1>
        
        <div className="image-section">
          <img src={rental.vehicleImage} alt={rental.vehicleName} className="rental-image" />
          
          <div className="basic-info">
            <h3>{rental.vehicleName}</h3>
            <p className="cost-info">Cost per day: ₹{rental.costPerDay}</p>
            <p className="location-info">Location: {rental.location}</p>
          </div>

          {/* Rental Info Section */}
          <div className="rental-info">
            <h3>Rental Information</h3>
            {rental.status === 'unavailable' && rental.buyerId ? (
              <>
                <p>
                  <strong>Renter Name:</strong> {rental.buyerId.firstName} {rental.buyerId.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {rental.buyerId.email}
                </p>
                <p>
                  <strong>Phone:</strong> {rental.buyerId.phone}
                </p>
                <p>
                  <strong>Pickup Date:</strong> {formattedPickupDate}
                </p>
                <p>
                  <strong>Drop Date:</strong> {formattedDropDate}
                </p>
                <p>
                  <strong>Money Received:</strong> ₹{moneyReceived !== null ? moneyReceived.toFixed(2) : 'Not specified'}
                </p>
              </>
            ) : (
              <p>No rental information available.</p>
            )}
          </div>
        </div>
        
        <div className="details-section">
          <h2>Vehicle Specifications</h2>
          
          <div className="detail-item">
            <span className="detail-label">Year</span>
            <span className="detail-value">{rental.year}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">AC</span>
            <span className="detail-value">{rental.AC === 'available' ? 'Available' : 'Not Available'}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Capacity</span>
            <span className="detail-value">{rental.capacity} passengers</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Condition</span>
            <span className="detail-value">{rental.condition.charAt(0).toUpperCase() + rental.condition.slice(1)}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Fuel Type</span>
            <span className="detail-value">{rental.fuelType.charAt(0).toUpperCase() + rental.fuelType.slice(1)}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Transmission</span>
            <span className="detail-value">{rental.transmission.charAt(0).toUpperCase() + rental.transmission.slice(1)}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Driver Available</span>
            <span className="detail-value">
              {rental.driverAvailable ? 'Yes' : 'No'}
              {rental.driverAvailable && (
                <> (₹{rental.driverRate} per day)</>
              )}
            </span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className="detail-value">
              {rental.status === 'available' ? 'Available' : 'Unavailable'}
              <span className={`status-badge status-${rental.status}`}>
                {rental.status}
              </span>
            </span>
          </div>
          
          <Link to="/seller/view-rentals" className="back-button">Back to Rentals</Link>
        </div>
      </section>
    </>
  );
};

export default RentalDetailsAlt;