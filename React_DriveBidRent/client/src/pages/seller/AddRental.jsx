import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import axiosInstance from '../../utils/axiosInstance.util';

const AddRental = () => {
  const [formData, setFormData] = useState({
    'vehicle-name': '',
    'vehicle-year': '',
    'vehicle-ac': '',
    'vehicle-capacity': '',
    'vehicle-condition': '',
    'vehicle-fuel-type': '',
    'vehicle-transmission': '',
    'rental-cost': '',
    'driver-available': '',
    'driver-rate': '',
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
      setError('Year must be between 1900 and 2025.');
      isValid = false;
    }

    // AC Availability
    if (!formData['vehicle-ac']) {
      setError('Please select AC availability.');
      isValid = false;
    }

    // Vehicle Capacity
    if (formData['vehicle-capacity'] < 1) {
      setError('Capacity must be at least 1 passenger.');
      isValid = false;
    }

    // Vehicle Condition, Fuel Type, Transmission - required
    ['vehicle-condition', 'vehicle-fuel-type', 'vehicle-transmission', 'driver-available'].forEach(field => {
      if (!formData[field]) {
        setError(`Please select ${field.replace('-', ' ')}.`);
        isValid = false;
      }
    });

    // Rental Cost
    if (formData['rental-cost'] <= 0) {
      setError('Cost must be a positive amount.');
      isValid = false;
    }

    // Driver Rate if available
    if (formData['driver-available'] === 'yes' && formData['driver-rate'] <= 0) {
      setError('Driver rate must be a positive amount if driver is available.');
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
      const response = await axiosInstance.post('/seller/add-rental', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setSuccess('Rental added successfully!');
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

  useEffect(() => {
    const driverAvailable = formData['driver-available'];
    const driverRateContainer = document.getElementById('driver-rate-container');
    if (driverRateContainer) {
      driverRateContainer.style.display = driverAvailable === 'yes' ? 'block' : 'none';
    }
  }, [formData['driver-available']]);

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
        .add-rental {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .add-rental h1 {
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

        /* Alert Messages */
        .alert {
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .alert-danger {
          background-color: #ffe5e5;
          color: #ff0000;
          border: 1px solid #ffcccc;
        }

        .alert-success {
          background-color: #e5ffe5;
          color: #008000;
          border: 1px solid #ccffcc;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dashboard-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <Navbar currentPage="add-rental" />
      <section className="add-rental">
        <h1>Add Vehicle for Rent</h1>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        {success && <div className="alert alert-success">{success}</div>}
        
        <form id="rental-form" onSubmit={handleSubmit}>
          <label htmlFor="vehicle-name">Vehicle Name:</label>
          <input type="text" id="vehicle-name" name="vehicle-name" value={formData['vehicle-name']} onChange={handleChange} required />
          <div id="vehicle-name-error" className="error-message">Vehicle name is required and should be at least 2 characters.</div>

          <label htmlFor="vehicle-image">Vehicle Image:</label>
          <input type="file" id="vehicle-image" name="vehicleImage" onChange={handleChange} required accept="image/*" />
          <div id="vehicle-image-error" className="error-message">Please upload a valid image file.</div>

          <label htmlFor="vehicle-year">Year:</label>
          <input type="number" id="vehicle-year" name="vehicle-year" value={formData['vehicle-year']} onChange={handleChange} required min="1900" max="2025" />
          <div id="vehicle-year-error" className="error-message">Year must be between 1900 and 2025.</div>

          <label htmlFor="vehicle-ac">AC:</label>
          <select id="vehicle-ac" name="vehicle-ac" value={formData['vehicle-ac']} onChange={handleChange} required>
            <option value="">Select AC Availability</option>
            <option value="available">Available</option>
            <option value="not">Not Available</option>
          </select>
          <div id="vehicle-ac-error" className="error-message">Please select AC availability.</div>

          <label htmlFor="vehicle-capacity">Capacity (passengers):</label>
          <input type="number" id="vehicle-capacity" name="vehicle-capacity" value={formData['vehicle-capacity']} onChange={handleChange} required min="1" />
          <div id="vehicle-capacity-error" className="error-message">Capacity must be at least 1 passenger.</div>
          
          <label htmlFor="vehicle-condition">Condition:</label>
          <select id="vehicle-condition" name="vehicle-condition" value={formData['vehicle-condition']} onChange={handleChange} required>
            <option value="">Select Condition</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
          <div id="vehicle-condition-error" className="error-message">Please select a vehicle condition.</div>

          <label htmlFor="vehicle-fuel-type">Fuel Type:</label>
          <select id="vehicle-fuel-type" name="vehicle-fuel-type" value={formData['vehicle-fuel-type']} onChange={handleChange} required>
            <option value="">Select Fuel Type</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
          </select>
          <div id="vehicle-fuel-type-error" className="error-message">Please select a fuel type.</div>

          <label htmlFor="vehicle-transmission">Transmission:</label>
          <select id="vehicle-transmission" name="vehicle-transmission" value={formData['vehicle-transmission']} onChange={handleChange} required>
            <option value="">Select Transmission</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
          <div id="vehicle-transmission-error" className="error-message">Please select a transmission type.</div>

          <label htmlFor="rental-cost">Cost/day (₹):</label>
          <input type="number" id="rental-cost" name="rental-cost" value={formData['rental-cost']} onChange={handleChange} required min="0" />
          <div id="rental-cost-error" className="error-message">Cost must be a positive amount.</div>

          <label htmlFor="driver-available">Driver Available:</label>
          <select id="driver-available" name="driver-available" value={formData['driver-available']} onChange={handleChange} required>
            <option value="">Select Driver Availability</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          <div id="driver-available-error" className="error-message">Please select driver availability.</div>

          <div id="driver-rate-container" style={{display: 'none'}}>
            <label htmlFor="driver-rate">Driver Rate (₹/day):</label>
            <input type="number" id="driver-rate" name="driver-rate" value={formData['driver-rate']} onChange={handleChange} />
            <div id="driver-rate-error" className="error-message">Driver rate must be a positive amount if driver is available.</div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>Submit</button>
        </form>
      </section>
      <Footer />
    </>
  );
};

export default AddRental;