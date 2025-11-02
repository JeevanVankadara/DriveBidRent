import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authServices } from '../../services/auth.services';

const Signup = () => {
  const [formData, setFormData] = useState({
    userType: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    doorNo: '',
    street: '',
    city: '',
    state: '',
    drivingLicense: '',
    shopName: '',
    experienceYears: '',
    googleAddressLink: '',
    repairBikes: false,
    repairCars: false,
    termsAccepted: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    // Same validation as in EJS JS
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword || !formData.dateOfBirth || !formData.userType) {
      setError("Please fill in all required fields.");
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return false;
    }
    const age = calculateAge(formData.dateOfBirth);
    if (age < 18) {
      setError("You must be at least 18 years old to sign up.");
      return false;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters long, include one uppercase letter, one number, and one special character.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (!formData.termsAccepted) {
      setError("You must accept the terms and conditions.");
      return false;
    }
    return true;
  };

  const calculateAge = (birthday) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await authServices.signup(formData);
      if (response.success) {
        setSuccess(response.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFields = (userType) => {
    // Show/hide based on userType as in EJS
    setFormData(prev => ({
      ...prev,
      userType
    }));
  };

  useEffect(() => {
    // Init based on formData.userType
    toggleFields(formData.userType);
  }, [formData.userType]);

  return (
    <>
      <style>{`
        .error-message {
          color: #dc3545;
          padding: 10px;
          margin-bottom: 15px;
          border-radius: 5px;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
        }
        .success-message {
          color: #155724;
          padding: 10px;
          margin-bottom: 15px;
          border-radius: 5px;
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
        }
        .age-error, .email-error {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: none;
        }
        .conditional-fields {
          display: none;
        }
        .form-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 30px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .form-title {
          text-align: center;
          margin-bottom: 30px;
          color: #333;
        }
        .input-group {
          position: relative;
          margin-bottom: 20px;
        }
        .input-group i {
          position: absolute;
          left: 15px;
          top: 15px;
          color: #777;
        }
        .input-group input, .input-group select {
          padding-left: 40px;
          width: 100%;
          height: 45px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
        }
        .btn {
          width: 100%;
          padding: 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        .btn:hover {
          background: #0069d9;
        }
        .btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        .service-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .service-item:last-child {
          border-bottom: none;
        }
        .service-name {
          font-weight: 500;
          color: #333;
        }
        .service-checkbox {
          height: 20px;
          width: 20px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-control {
          width: 100%;
          height: 45px;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 0 15px;
          font-size: 16px;
        }
        .form-row {
          display: flex;
          gap: 15px;
        }
        .form-group.col-md-6 {
          flex: 1;
        }
        .form-text {
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        .text-muted {
          color: #6c757d !important;
        }
        .text-center {
          text-align: center;
        }
        .mt-3 {
          margin-top: 1rem;
        }
        .form-check {
          padding-left: 0;
        }
        .loading {
          opacity: 0.7;
          pointer-events: none;
        }
      `}</style>
      <div className="container">
        <div className="form-container">
          <h1 className="form-title">Create an Account</h1>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleSubmit} className={loading ? 'loading' : ''}>
            <div className="form-group">
              <label htmlFor="userType">I am a:</label>
              <select id="userType" name="userType" className="form-control" value={formData.userType} onChange={handleChange} required>
                <option value="">Select user type</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller/Renter</option>
                <option value="mechanic">Mechanic</option>
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="firstName">First Name</label>
                <div className="input-group">
                  <i className="fas fa-user"></i>
                  <input type="text" id="firstName" name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="lastName">Last Name</label>
                <div className="input-group">
                  <i className="fas fa-user"></i>
                  <input type="text" id="lastName" name="lastName" className="form-control" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-group">
                <i className="fas fa-envelope"></i>
                <input type="email" id="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-group">
                <i className="fas fa-phone"></i>
                <input type="tel" id="phone" name="phone" className="form-control" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password (at least 8 characters)</label>
              <div className="input-group">
                <i className="fas fa-lock"></i>
                <input type="password" id="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-group">
                <i className="fas fa-lock"></i>
                <input type="password" id="confirmPassword" name="confirmPassword" className="form-control" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <div className="input-group">
                <i className="fas fa-calendar"></i>
                <input type="date" id="dateOfBirth" name="dateOfBirth" className="form-control" value={formData.dateOfBirth} onChange={handleChange} required />
              </div>
            </div>

            {/* Address Fields - conditional */}
            <div className={['buyer', 'seller', 'driver'].includes(formData.userType) ? 'conditional-fields' : 'conditional-fields display-block'}>
              {/* Address inputs as in EJS */}
              <div className="form-group">
                <label htmlFor="doorNo">Door No.</label>
                <input type="text" id="doorNo" name="doorNo" className="form-control" value={formData.doorNo} onChange={handleChange} />
              </div>
              {/* ... other address fields similarly */}
            </div>
            
            {/* Mechanic Fields - conditional */}
            <div className={formData.userType === 'mechanic' ? 'conditional-fields' : 'conditional-fields display-block'}>
              {/* Mechanic inputs as in EJS */}
            </div>
            
            {/* Terms */}
            <div className="form-group form-check">
              <div className="service-item">
                <span className="service-name">I accept the Terms and Conditions</span>
                <input className="service-checkbox" type="checkbox" id="termsAccepted" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="form-group">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
            
            <div className="text-center mt-3">
              Already have an account? <a href="/login">Log in</a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;