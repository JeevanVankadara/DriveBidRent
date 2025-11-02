import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import axiosInstance from '../../utils/axiosInstance.util';

const RentalDetails = () => {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const response = await axiosInstance.get(`/seller/rental-details/${id}`);
        if (response.data.success) {
          setRental(response.data.data.rental);
          // moneyReceived from response.data.data.moneyReceived if needed
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to load rental details');
      }
    };
    fetchRental();
  }, [id]);

  if (error) {
    return (
      <div className="error-message">{error}</div>
    );
  }

  if (!rental) {
    return <div>Loading...</div>;
  }

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
        }

        .rental-details-container h1 {
            color: #ff6b00;
            font-size: 2.5rem;
            margin-bottom: 2rem;
            text-align: center;
        }

        .details-wrapper {
            display: flex;
            gap: 2rem;
            background-color: #ffffff;
            border-radius: 0.5rem;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
            padding: 2rem;
        }

        .image-section {
            flex: 1;
            min-width: 300px;
        }

        .details-section {
            flex: 1;
            min-width: 300px;
        }

        .vehicle-image {
            width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
        }

        .basic-info {
            margin-bottom: 2rem;
        }

        .vehicle-name {
            font-size: 1.8rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 0.5rem;
        }

        .cost-info, .location-info {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 0.5rem;
        }

        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }

        .details-table tr {
            border-bottom: 1px solid #eee;
        }

        .details-table td {
            padding: 0.8rem 0;
        }

        .detail-label {
            font-weight: 600;
            color: #555;
            width: 40%;
        }

        .detail-value {
            color: #333;
        }

        .back-btn {
            display: inline-block;
            background-color: #ff6b00;
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.3rem;
            text-decoration: none;
            font-weight: 500;
            margin-top: 2rem;
            transition: background 0.3s ease;
        }

        .back-btn:hover {
            background-color: #ff8c3f;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .details-wrapper {
                flex-direction: column;
            }
        }
      `}</style>
      <Navbar currentPage="view-rentals" />
      <section className="rental-details-container">
        <h1>Rental Vehicle Details</h1>
        
        <div className="details-wrapper">
          <div className="image-section">
            <img src={rental.vehicleImage} alt={rental.vehicleName} className="vehicle-image" />
            <div className="basic-info">
              <h2 className="vehicle-name">{rental.vehicleName}</h2>
              <p className="cost-info">Cost per day: ₹{rental.costPerDay}</p>
              <p className="location-info">Location: {rental.location}</p>
            </div>
          </div>
          
          <div className="details-section">
            <table className="details-table">
              <tbody>
                <tr>
                  <td className="detail-label">Year:</td>
                  <td className="detail-value">{rental.year}</td>
                </tr>
                <tr>
                  <td className="detail-label">AC:</td>
                  <td className="detail-value">{rental.ac ? 'Available' : 'Not Available'}</td>
                </tr>
                <tr>
                  <td className="detail-label">Capacity:</td>
                  <td className="detail-value">{rental.capacity} passengers</td>
                </tr>
                <tr>
                  <td className="detail-label">Condition:</td>
                  <td className="detail-value">{rental.condition}</td>
                </tr>
                <tr>
                  <td className="detail-label">Fuel Type:</td>
                  <td className="detail-value">{rental.fuelType}</td>
                </tr>
                <tr>
                  <td className="detail-label">Transmission:</td>
                  <td className="detail-value">{rental.transmission}</td>
                </tr>
                <tr>
                  <td className="detail-label">Driver Available:</td>
                  <td className="detail-value">{rental.driverAvailable ? 'Yes' : 'No'}</td>
                </tr>
                {rental.driverAvailable && (
                  <tr>
                    <td className="detail-label">Driver Rate:</td>
                    <td className="detail-value">₹{rental.driverRate} per day</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <a href="/seller/view-rentals" className="back-btn">Back to Rentals</a>
      </section>
      <Footer />
    </>
  );
};

export default RentalDetails;