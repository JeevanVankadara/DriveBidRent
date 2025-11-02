import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';

const UpdateRental = () => {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [formData, setFormData] = useState({
    'rental-cost': '',
    'driver-available': '',
    'driver-rate': '',
    status: ''
  });
  const [isBeforeReturnDate, setIsBeforeReturnDate] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const response = await axiosInstance.get(`/seller/rental-details/${id}`);
        if (response.data.success) {
          const fetchedRental = response.data.data.rental;
          setRental(fetchedRental);
          setFormData({
            'rental-cost': fetchedRental.costPerDay,
            'driver-available': fetchedRental.driverAvailable ? 'yes' : 'no',
            'driver-rate': fetchedRental.driverRate || '',
            status: fetchedRental.status
          });
          // Calculate isBeforeReturnDate
          const currentDate = new Date();
          setIsBeforeReturnDate(fetchedRental.dropDate && currentDate < new Date(fetchedRental.dropDate));
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to load rental data');
      }
    };
    fetchRental();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let hasErrors = false;
    setError(null);

    // Validate cost
    const cost = parseFloat(formData['rental-cost']);
    if (isNaN(cost) || cost <= 0) {
      hasErrors = true;
      setError('Cost per day must be greater than 0.');
    }

    // Validate status
    if (!formData.status) {
      hasErrors = true;
      setError('Please select a status.');
    }

    // Validate driver available
    if (!formData['driver-available']) {
      hasErrors = true;
      setError('Please select if driver is available.');
    }

    // Check driver rate if driver is available
    if (formData['driver-available'] === 'yes') {
      const driverRate = parseFloat(formData['driver-rate']);
      if (isNaN(driverRate) || driverRate <= 0) {
        hasErrors = true;
        setError('Driver rate must be greater than 0.');
      }
    }

    // Prevent invalid status change
    if (rental.status === 'unavailable' && formData.status === 'available' && isBeforeReturnDate) {
      hasErrors = true;
      setError('Cannot change status from unavailable to available before the return date');
    }

    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(`/seller/update-rental/${id}`, formData);
      if (response.data.success) {
        setSuccess('Rental updated successfully!');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Unable to update: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

        .update-container {
          padding: 4rem 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .update-title {
          color: #ff6b00;
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .update-form {
          background-color: #ffffff;
          border-radius: 0.5rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #555;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 0.3rem;
          font-size: 1rem;
        }

        .form-control:focus {
          outline: none;
          border-color: #ff6b00;
        }

        .radio-group {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .radio-option input[type="radio"] {
          margin: 0;
        }

        .driver-rate-container {
          margin-top: 1rem;
          padding-left: 1.5rem;
          border-left: 2px solid #ff6b00;
          display: none;
        }

        .btn {
          background-color: #ff6b00;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.3rem;
          font-weight: 500;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s ease;
        }

        .btn:hover {
          background-color: #ff8c3f;
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .back-btn {
          display: inline-block;
          margin-top: 1rem;
          color: #ff6b00;
          text-decoration: none;
          font-weight: 500;
        }

        .back-btn:hover {
          text-decoration: underline;
        }

        .error-message {
          color: #ff0000;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background-color: #ffeeee;
          border-radius: 0.3rem;
        }

        .success-message {
          color: #2e7d32;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background-color: #e6f7e6;
          border-radius: 0.3rem;
        }

        .select-dropdown {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 0.3rem;
          font-size: 1rem;
          background-color: white;
        }
        
        .note {
          font-size: 0.9rem;
          color: #666;
          font-style: italic;
          margin-top: 0.5rem;
        }
      `}</style>
      <section className="update-container">
        <h1 className="update-title">Update Rental Vehicle</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        {success && <div className="success-message">{success}</div>}
        
        <form className="update-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Cost per day (₹)</label>
            <input type="number" className="form-control" name="rental-cost" 
                   value={formData['rental-cost']} onChange={handleChange} step="0.01" min="0" required />
          </div>
          
          <div className="form-group">
            <label className="form-label">Driver Available</label>
            <div className="radio-group">
              <label className="radio-option">
                <input type="radio" name="driver-available" value="yes" 
                       checked={formData['driver-available'] === 'yes'} onChange={handleChange} />
                Yes
              </label>
              <label className="radio-option">
                <input type="radio" name="driver-available" value="no" 
                       checked={formData['driver-available'] === 'no'} onChange={handleChange} />
                No
              </label>
            </div>
            
            <div className="driver-rate-container" style={{display: formData['driver-available'] === 'yes' ? 'block' : 'none'}}>
              <label className="form-label">Driver Rate per day (₹)</label>
              <input type="number" className="form-control" name="driver-rate" 
                     value={formData['driver-rate']} onChange={handleChange} step="0.01" min="0" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="select-dropdown" name="status" value={formData.status} onChange={handleChange} required>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            
            {isBeforeReturnDate && rental.status === 'unavailable' && (
              <p className="note">
                Note: This rental cannot be changed from unavailable to available before the return date: 
                {new Date(rental.dropDate).toLocaleDateString()}
              </p>
            )}
          </div>
          
          <button type="submit" className="btn" disabled={isSubmitting}>Update Rental</button>
          <Link to="/seller/view-rentals" className="back-btn">Back to Rentals</Link>
        </form>
      </section>
    </>
  );
};

export default UpdateRental;