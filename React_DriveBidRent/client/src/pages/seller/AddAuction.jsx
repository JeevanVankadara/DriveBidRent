import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import axiosInstance from '../../utils/axiosInstance.util';

const AddAuction = () => {
  const [formData, setFormData] = useState({
    'vehicle-name': '',
    'vehicle-year': '',
    'vehicle-mileage': '',
    'fuel-type': '',
    'transmission': '',
    'vehicle-condition': '',
    'auction-date': '',
    'starting-bid': '',
    vehicleImage: null
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const validateForm = () => {
    let isValid = true;
    setError(null);

    // Vehicle Name
    if (formData['vehicle-name'].trim().length < 2) {
      setError('Vehicle name is required and should be at least 2 characters.');
      isValid = false;
    }

    // Vehicle Image
    if (!formData.vehicleImage || !formData.vehicleImage.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      isValid = false;
    }

    // Vehicle Year
    const currentYear = new Date().getFullYear();
    if (formData['vehicle-year'] < 1900 || formData['vehicle-year'] > currentYear) {
      setError('Year must be between 1900 and current year.');
      isValid = false;
    }

    // Vehicle Mileage
    if (formData['vehicle-mileage'] <= 0) {
      setError('Mileage must be a positive number.');
      isValid = false;
    }

    // Fuel Type, Transmission, Condition, Auction Date, Starting Bid - basic required checks
    ['fuel-type', 'transmission', 'vehicle-condition', 'auction-date', 'starting-bid'].forEach(field => {
      if (!formData[field]) {
        setError(`Please select or enter ${field.replace('-', ' ')}.`);
        isValid = false;
      }
    });

    // Auction Date future check
    const auctionDate = new Date(formData['auction-date']);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (auctionDate < currentDate) {
      setError('Auction date must be today or in the future.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    try {
      const response = await axiosInstance.post('/seller/add-auction', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setSuccess('Auction added successfully!');
        setFormData({ /* reset form */ });
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

        /* Forms */
        .add-auction {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .add-auction h1 {
          color: #ff6b00;
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        form {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          margin: 0 auto;
        }

        form label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333333;
          font-weight: 500;
        }

        form input,
        form select,
        form textarea {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 0.5rem;
          font-size: 1rem;
        }

        form textarea {
          resize: vertical;
          min-height: 100px;
        }

        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: -0.75rem;
          margin-bottom: 0.75rem;
          display: none;
        }

        .submit-btn {
          display: block;
          width: 100%;
          background: linear-gradient(135deg, #ff6b00, #ff9a44);
          color: white;
          padding: 0.75rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .submit-btn:hover,
        .submit-btn:disabled {
          background: linear-gradient(135deg, #ff9a44, #ff6b00);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dashboard-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <Navbar currentPage="add-auction" />
      <section className="add-auction">
        <h1>Add Vehicle for Auction</h1>
        <form id="auction-form" onSubmit={handleSubmit}>
          <label htmlFor="vehicle-name">Vehicle Name:</label>
          <input type="text" id="vehicle-name" name="vehicle-name" value={formData['vehicle-name']} onChange={handleChange} required />
          <div id="vehicle-name-error" className="error-message">Vehicle name is required and should be at least 2 characters.</div>

          <label htmlFor="vehicle-image">Vehicle Image:</label>
          <input type="file" id="vehicle-image" name="vehicleImage" onChange={handleChange} required accept="image/*" />
          <div id="vehicle-image-error" className="error-message">Please upload a valid image file.</div>

          <label htmlFor="vehicle-year">Year:</label>
          <input type="number" id="vehicle-year" name="vehicle-year" value={formData['vehicle-year']} onChange={handleChange} required min="1900" max="2025" />
          <div id="vehicle-year-error" className="error-message">Year must be between 1900 and current year (2025).</div>

          <label htmlFor="vehicle-mileage">Mileage (km):</label>
          <input type="number" id="vehicle-mileage" name="vehicle-mileage" value={formData['vehicle-mileage']} onChange={handleChange} required min="0" />
          <div id="vehicle-mileage-error" className="error-message">Mileage must be a positive number.</div>

          <label htmlFor="fuel-type">Fuel Type:</label>
          <select id="fuel-type" name="fuel-type" value={formData['fuel-type']} onChange={handleChange} required>
            <option value="">Select Fuel Type</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
          </select>
          <div id="fuel-type-error" className="error-message">Please select a fuel type.</div>

          <label htmlFor="transmission">Transmission:</label>
          <select id="transmission" name="transmission" value={formData['transmission']} onChange={handleChange} required>
            <option value="">Select Transmission</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
          </select>
          <div id="transmission-error" className="error-message">Please select a transmission type.</div>

          <label htmlFor="vehicle-condition">Condition:</label>
          <select id="vehicle-condition" name="vehicle-condition" value={formData['vehicle-condition']} onChange={handleChange} required>
            <option value="">Select Condition</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
          <div id="vehicle-condition-error" className="error-message">Please select a vehicle condition.</div>

          <label htmlFor="auction-date">Auction Date:</label>
          <input type="date" id="auction-date" name="auction-date" value={formData['auction-date']} onChange={handleChange} required />
          <div id="auction-date-error" className="error-message">Auction date must be today or in the future.</div>

          <label htmlFor="starting-bid">Starting Bid (₹):</label>
          <input type="number" id="starting-bid" name="starting-bid" value={formData['starting-bid']} onChange={handleChange} required min="0" />
          <div id="starting-bid-error" className="error-message">Starting bid must be a positive amount.</div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>Submit</button>
        </form>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </section>
      <Footer />
    </>
  );
};

export default AddAuction;