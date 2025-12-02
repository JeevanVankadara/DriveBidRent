// client/src/pages/auth/Signup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../../redux/slices/authSlice';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success, message } = useSelector((state) => state.auth);

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
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (success) {
      alert(message || 'Account created! Redirecting to login...');
      navigate('/login');
    }
  }, [success, message, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) error = 'Required';
        break;
      case 'email':
        if (!value) error = 'Required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email';
        break;
      case 'phone':
        if (!value) error = 'Required';
        else if (!/^\d{10}$/.test(value)) error = '10 digits only';
        break;
      case 'password':
        if (!value) error = 'Required';
        else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value))
          error = '8+ chars, uppercase, number, special char';
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'Passwords do not match';
        break;
      case 'dateOfBirth':
        if (!value) error = 'Required';
        else {
          const age = new Date().getFullYear() - new Date(value).getFullYear();
          const diff = new Date() - new Date(value);
          if (diff < 18 * 365.25 * 24 * 60 * 60 * 1000) error = 'Must be 18+';
        }
        break;
      case 'userType':
        if (!value) error = 'Select a role';
        break;
      case 'termsAccepted':
        if (!formData.termsAccepted) error = 'Must accept terms'; // Use formData
        break;
      default:
        break;
    }
    return error;
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateAll();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Object.keys(newErrors).forEach((key) => {
        setTouched((prev) => ({ ...prev, [key]: true }));
      });
      return;
    }

    // Remove confirmPassword before sending to backend
    const { confirmPassword, ...signupData } = formData;
    dispatch(signupUser(signupData));
  };

  const getBorderColor = (field) => {
    if (!touched[field]) return 'border-gray-300';
    return errors[field] ? 'border-red-500' : 'border-green-500';
  };

  return (
    <>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
        rel="stylesheet"
      />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Create an Account
          </h1>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">I am a:</label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                onBlur={() => setTouched((p) => ({ ...p, userType: true }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${getBorderColor('userType')}`}
              >
                <option value="">Select user type</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller/Renter</option>
                <option value="mechanic">Mechanic</option>
              </select>
              {errors.userType && touched.userType && (
                <p className="text-red-500 text-sm mt-1">{errors.userType}</p>
              )}
            </div>

            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">First Name</label>
                <div className="relative">
                  <i className="fas fa-user absolute left-3 top-3 text-gray-500"></i>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${getBorderColor('firstName')}`}
                  />
                </div>
                {errors.firstName && touched.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Last Name</label>
                <div className="relative">
                  <i className="fas fa-user absolute left-3 top-3 text-gray-500"></i>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${getBorderColor('lastName')}`}
                  />
                </div>
                {errors.lastName && touched.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-3 text-gray-500"></i>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${getBorderColor('email')}`}
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <i className="fas fa-phone absolute left-3 top-3 text-gray-500"></i>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                  maxLength="10"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${getBorderColor('phone')}`}
                />
              </div>
              {errors.phone && touched.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Passwords */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-3 text-gray-500"></i>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${getBorderColor('password')}`}
                />
              </div>
              {errors.password && touched.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-3 text-gray-500"></i>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${getBorderColor('confirmPassword')}`}
                />
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* DOB */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Date of Birth</label>
              <div className="relative">
                <i className="fas fa-calendar absolute left-3 top-3 text-gray-500"></i>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  onBlur={() => setTouched((p) => ({ ...p, dateOfBirth: true }))}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${getBorderColor('dateOfBirth')}`}
                />
              </div>
              {errors.dateOfBirth && touched.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Address Fields - Buyer & Seller */}
            {(formData.userType === 'buyer' || formData.userType === 'seller') && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Address</h3>
                <input
                  type="text"
                  name="doorNo"
                  placeholder="Door No."
                  value={formData.doorNo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  name="street"
                  placeholder="Street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select City</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Kurnool">Kurnool</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                  </select>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Mechanic Fields */}
            {formData.userType === 'mechanic' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Mechanic Details</h3>
                <input
                  type="text"
                  name="shopName"
                  placeholder="Shop Name"
                  value={formData.shopName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  name="doorNo"
                  placeholder="Shop Door No."
                  value={formData.doorNo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  name="street"
                  placeholder="Shop Street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select City</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Kurnool">Kurnool</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                  </select>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <input
                  type="number"
                  name="experienceYears"
                  placeholder="Experience (Years)"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="repairBikes"
                      checked={formData.repairBikes}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Bike Repair</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="repairCars"
                      checked={formData.repairCars}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Car Repair</span>
                  </label>
                </div>
                <input
                  type="url"
                  name="googleAddressLink"
                  placeholder="Google Maps Link"
                  value={formData.googleAddressLink}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            )}

            {/* Terms */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                onBlur={() => setTouched((p) => ({ ...p, termsAccepted: true }))}
                className="mr-2"
              />
              <label className="text-sm">
                I accept the{' '}
                <a href="#" className="text-orange-600 hover:underline">
                  Terms and Conditions
                </a>
              </label>
            </div>
            {errors.termsAccepted && touched.termsAccepted && (
              <p className="text-red-500 text-sm">{errors.termsAccepted}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-70 transition"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-orange-600 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;