import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';
import toast from 'react-hot-toast';

const AddAuction = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('basic'); // basic, documents, history
  
  const [formData, setFormData] = useState({
    // Basic Vehicle Info
    'vehicle-name': '',
    'car-type': '',
    'vehicle-year': '',
    'vehicle-mileage': '',
    'fuel-type': '',
    'transmission': '',
    'vehicle-condition': '',
    'auction-date': '',
    'starting-bid': '',
    vehicleImage: null,
    
    // Registration & Ownership
    'registration-number': '',
    'registration-state': '',
    'ownership-type': '',
    'registration-certificate': null,
    
    // VIN & Chassis
    'vin-number': '',
    'chassis-number': '',
    'engine-number': '',
    
    // Insurance
    'insurance-status': '',
    'insurance-expiry-date': '',
    'insurance-type': '',
    'previous-insurance-claims': 'no',
    'insurance-claim-details': '',
    'insurance-document': null,
    
    // Accident & Damage
    'accident-history': 'no',
    'number-of-accidents': '0',
    'accident-details': '',
    'major-repairs': 'no',
    'repair-details': '',
    
    // Legal & Transfer
    'hypothecation-status': '',
    'loan-provider': '',
    'noc-available': 'no',
    'ready-for-transfer': 'yes',
    
    // Theft & Legal Check
    'stolen-vehicle-check': '',
    'police-noc': 'no',
    'court-cases': 'no',
    'court-case-details': '',
    
    // Odometer & Service
    'odometer-reading': '',
    'odometer-verified': 'no',
    'odometer-tampering': 'No Tampering',
    'service-history': 'No Records',
    'last-service-date': '',
    'service-book-available': 'no',
    
    // Pollution & Fitness
    'pollution-certificate': '',
    'pollution-expiry-date': '',
    'fitness-certificate': null,
    'fitness-certificate-expiry': '',
    
    // Additional Documents
    'rc-transfer-form29': null,
    'rc-transfer-form30': null,
    'road-tax-receipt': null,
    'address-proof': null,
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked ? 'yes' : 'no',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validate = () => {
    // Basic Info Validation
    if (formData['vehicle-name'].trim().length < 2) return 'Vehicle name must be ≥ 2 chars';
    if (!formData.vehicleImage?.type.startsWith('image/')) return 'Valid vehicle image required';
    if (!formData['car-type']) return 'Select car type';
    if (formData['vehicle-year'] < 1900 || formData['vehicle-year'] > new Date().getFullYear())
      return 'Year must be 1900–current';
    if (formData['vehicle-mileage'] <= 0) return 'Mileage must be > 0';
    if (!formData['fuel-type']) return 'Select fuel type';
    if (!formData['transmission']) return 'Select transmission';
    if (!formData['vehicle-condition']) return 'Select condition';
    if (!formData['auction-date']) return 'Select auction date';
    if (new Date(formData['auction-date']) < new Date().setHours(0, 0, 0, 0))
      return 'Auction date must be today or later';
    if (formData['starting-bid'] <= 0) return 'Starting bid must be > 0';
    
    // Documentation Validation
    if (!formData['registration-number'] || formData['registration-number'].trim().length < 4) 
      return 'Valid registration number required (min 4 characters)';
    if (!formData['registration-state']) return 'Registration state required';
    if (!formData['ownership-type']) return 'Ownership type required';
    if (!formData['vin-number'] || formData['vin-number'].trim().length < 10) 
      return 'Valid VIN number required (min 10 characters)';
    if (!formData['chassis-number'] || formData['chassis-number'].trim().length < 5) 
      return 'Valid chassis number required';
    if (!formData['engine-number'] || formData['engine-number'].trim().length < 5) 
      return 'Valid engine number required';
    
    // Insurance Validation
    if (!formData['insurance-status']) return 'Insurance status required';
    if (formData['insurance-status'] === 'Valid' && !formData['insurance-expiry-date']) 
      return 'Insurance expiry date required for valid insurance';
    if (formData['insurance-status'] === 'Valid' && !formData['insurance-type']) 
      return 'Insurance type required';
    
    // Legal Validation
    if (!formData['hypothecation-status']) return 'Hypothecation status required';
    if (formData['hypothecation-status'] === 'Under Loan/Hypothecation' && !formData['loan-provider']) 
      return 'Loan provider name required';
    if (!formData['stolen-vehicle-check']) return 'Stolen vehicle check status required';
    if (!formData['ready-for-transfer']) return 'Transfer readiness status required';
    
    // Odometer Validation
    if (!formData['odometer-reading'] || formData['odometer-reading'] <= 0) 
      return 'Valid odometer reading required';
    
    // Pollution Validation
    if (!formData['pollution-certificate']) return 'Pollution certificate status required';
    if (formData['pollution-certificate'] === 'Valid' && !formData['pollution-expiry-date']) 
      return 'Pollution certificate expiry date required';
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      toast.error(err);
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    const data = new FormData();
    
    // Append all form data
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        data.append(key, value);
      }
    });
    
    // Log submitted documentation fields for debugging
    console.log('📋 [AddAuction] Submitting with documentation fields:', {
      registrationNumber: formData['registration-number'],
      vinNumber: formData['vin-number'],
      chassisNumber: formData['chassis-number'],
      insuranceStatus: formData['insurance-status'],
      accidentHistory: formData['accident-history'],
      pollutionCertificate: formData['pollution-certificate'],
      odometerReading: formData['odometer-reading'],
    });
    
    try {
      const res = await axiosInstance.post('/seller/add-auction', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('📦 [AddAuction] Server response:', res.data);
      
      if (res.data.success) {
        toast.success('Auction request submitted successfully! Pending admin approval.');
        navigate('/seller/view-auctions');
      } else {
        setError(res.data.message || 'Failed to submit auction');
        toast.error(res.data.message || 'Failed');
      }
    } catch (err) {
      console.error('❌ [AddAuction] Submission error:', err);
      const errorMsg = err.response?.data?.message || 'Network error';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Puducherry', 'Chandigarh'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-2">
          Add Vehicle for Auction
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Complete all sections with accurate vehicle information and documentation
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Section Tabs */}
        <div className="bg-white rounded-t-xl shadow-lg border-b-2 border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSection('basic')}
              className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                activeSection === 'basic'
                  ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-car mr-2"></i>
              Basic Information
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('documents')}
              className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                activeSection === 'documents'
                  ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-file-alt mr-2"></i>
              Legal Documents
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('history')}
              className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                activeSection === 'history'
                  ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-history mr-2"></i>
              Vehicle History
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-b-xl shadow-lg">
          
          {/* BASIC INFORMATION SECTION */}
          {activeSection === 'basic' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-200">
                Vehicle Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-2">
                    Vehicle Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="vehicle-name"
                    value={formData['vehicle-name']}
                    onChange={handleChange}
                    placeholder="e.g., Maruti Suzuki Swift VXI"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-2">
                    Vehicle Image <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="vehicleImage"
                    onChange={handleChange}
                    accept="image/*"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Upload a clear image of the vehicle (Front/Side view preferred)</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-3">
                    Car Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Wagon'].map((type) => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="car-type"
                          value={type}
                          checked={formData['car-type'] === type}
                          onChange={handleChange}
                          required
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Manufacturing Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="vehicle-year"
                    value={formData['vehicle-year']}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder={new Date().getFullYear()}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Mileage (km) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="vehicle-mileage"
                    value={formData['vehicle-mileage']}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g., 45000"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Fuel Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="fuel-type"
                    value={formData['fuel-type']}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="cng">CNG</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Transmission <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="transmission"
                    value={formData['transmission']}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Transmission</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="semi-automatic">Semi-Automatic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Overall Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vehicle-condition"
                    value={formData['vehicle-condition']}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Condition</option>
                    <option value="excellent">Excellent - Like New</option>
                    <option value="good">Good - Minor Wear</option>
                    <option value="fair">Fair - Some Issues</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Auction Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="auction-date"
                    value={formData['auction-date']}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Starting Bid Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="starting-bid"
                    value={formData['starting-bid']}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g., 350000"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* LEGAL DOCUMENTS SECTION */}
          {activeSection === 'documents' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-200">
                Legal Documents & Verification
              </h2>
              
              {/* Registration Details */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                  <i className="fas fa-id-card mr-2"></i>
                  Registration & Ownership
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Registration Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="registration-number"
                      value={formData['registration-number']}
                      onChange={handleChange}
                      placeholder="e.g., MH12AB1234"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Registration State <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="registration-state"
                      value={formData['registration-state']}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    >
                 <option value="">Select State</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Ownership Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="ownership-type"
                      value={formData['ownership-type']}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Owner Count</option>
                      <option value="First Owner">First Owner</option>
                      <option value="Second Owner">Second Owner</option>
                      <option value="Third Owner">Third Owner</option>
                      <option value="Fourth Owner or More">Fourth Owner or More</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      RC (Registration Certificate) Copy
                    </label>
                    <input
                      type="file"
                      name="registration-certificate"
                      onChange={handleChange}
                      accept="application/pdf,image/*"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload PDF or Image</p>
                  </div>
                </div>
              </div>

              {/* VIN & Engine Details */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                  <i className="fas fa-barcode mr-2"></i>
                  VIN & Identification Numbers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      VIN Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="vin-number"
                      value={formData['vin-number']}
                      onChange={handleChange}
                      placeholder="17-digit VIN"
                      required
                      maxLength="17"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Vehicle Identification Number</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Chassis Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="chassis-number"
                      value={formData['chassis-number']}
                      onChange={handleChange}
                      placeholder="Chassis No."
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Engine Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="engine-number"
                      value={formData['engine-number']}
                      onChange={handleChange}
                      placeholder="Engine No."
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Insurance Details */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
                  <i className="fas fa-shield-alt mr-2"></i>
                  Insurance Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Insurance Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="insurance-status"
                      value={formData['insurance-status']}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Status</option>
                      <option value="Valid">Valid Insurance</option>
                      <option value="Expired">Expired</option>
                      <option value="No Insurance">No Insurance</option>
                    </select>
                  </div>

                  {formData['insurance-status'] === 'Valid' && (
                    <>
                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">
                          Insurance Expiry Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="insurance-expiry-date"
                          value={formData['insurance-expiry-date']}
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">
                          Insurance Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="insurance-type"
                          value={formData['insurance-type']}
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">Select Type</option>
                          <option value="Comprehensive">Comprehensive</option>
                          <option value="Third Party">Third Party</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">
                          Insurance Certificate Copy
                        </label>
                        <input
                          type="file"
                          name="insurance-document"
                          onChange={handleChange}
                          accept="application/pdf,image/*"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="previous-insurance-claims"
                        checked={formData['previous-insurance-claims'] === 'yes'}
                        onChange={handleChange}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="font-semibold text-gray-700">
                        Any Previous Insurance Claims?
                      </span>
                    </label>
                  </div>

                  {formData['previous-insurance-claims'] === 'yes' && (
                    <div className="md:col-span-2">
                      <label className="block font-semibold text-gray-700 mb-2">
                        Insurance Claim Details
                      </label>
                      <textarea
                        name="insurance-claim-details"
                        value={formData['insurance-claim-details']}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Describe the insurance claims (year, type, amount, etc.)"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Legal & Transfer Status */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center">
                  <i className="fas fa-gavel mr-2"></i>
                  Legal & Transfer Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Hypothecation Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="hypothecation-status"
                      value={formData['hypothecation-status']}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Status</option>
                      <option value="Clear - No Loan">Clear - No Loan</option>
                      <option value="Under Loan/Hypothecation">Under Loan/Hypothecation</option>
                    </select>
                  </div>

                  {formData['hypothecation-status'] === 'Under Loan/Hypothecation' && (
                    <>
                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">
                          Loan Provider (Bank/NBFC) <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="loan-provider"
                          value={formData['loan-provider']}
                          onChange={handleChange}
                          placeholder="e.g., HDFC Bank"
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="noc-available"
                            checked={formData['noc-available'] === 'yes'}
                            onChange={handleChange}
                            className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                          />
                          <span className="font-semibold text-gray-700">
                            NOC (No Objection Certificate) Available from Bank?
                          </span>
                        </label>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Stolen Vehicle Verification <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="stolen-vehicle-check"
                      value={formData['stolen-vehicle-check']}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Status</option>
                      <option value="Verified Clean">Verified Clean - Not Stolen</option>
                      <option value="Not Verified">Not Verified</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 h-full items-end pb-2">
                      <input
                        type="checkbox"
                        name="police-noc"
                        checked={formData['police-noc'] === 'yes'}
                        onChange={handleChange}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="font-semibold text-gray-700">
                        Police NOC Available?
                      </span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="court-cases"
                        checked={formData['court-cases'] === 'yes'}
                        onChange={handleChange}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="font-semibold text-gray-700">
                        Any Pending Court Cases Related to Vehicle?
                      </span>
                    </label>
                  </div>

                  {formData['court-cases'] === 'yes' && (
                    <div className="md:col-span-2">
                      <label className="block font-semibold text-gray-700 mb-2">
                        Court Case Details
                      </label>
                      <textarea
                        name="court-case-details"
                        value={formData['court-case-details']}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Provide details about the court case"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="ready-for-transfer"
                        checked={formData['ready-for-transfer'] === 'yes'}
                        onChange={handleChange}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="font-semibold text-gray-700">
                        Vehicle is Ready for Ownership Transfer <span className="text-red-500">*</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Pollution & Additional Documents */}
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <h3 className="text-lg font-bold text-teal-800 mb-4 flex items-center">
                  <i className="fas fa-leaf mr-2"></i>
                  Pollution & Fitness Certificates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Pollution Certificate Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="pollution-certificate"
                      value={formData['pollution-certificate']}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Status</option>
                      <option value="Valid">Valid PUC</option>
                      <option value="Expired">Expired</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </div>

                  {formData['pollution-certificate'] === 'Valid' && (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">
                        PUC Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="pollution-expiry-date"
                        value={formData['pollution-expiry-date']}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Fitness Certificate (Commercial Vehicles)
                    </label>
                    <input
                      type="file"
                      name="fitness-certificate"
                      onChange={handleChange}
                      accept="application/pdf,image/*"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Fitness Expiry Date (If Applicable)
                    </label>
                    <input
                      type="date"
                      name="fitness-certificate-expiry"
                      value={formData['fitness-certificate-expiry']}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Transfer Forms & Documents */}
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <i className="fas fa-paperclip mr-2"></i>
                  Additional Transfer Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      RC Transfer Form 29
                    </label>
                    <input
                      type="file"
                      name="rc-transfer-form29"
                      onChange={handleChange}
                      accept="application/pdf,image/*"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Form 29 - Notice of Transfer</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      RC Transfer Form 30
                    </label>
                    <input
                      type="file"
                      name="rc-transfer-form30"
                      onChange={handleChange}
                      accept="application/pdf,image/*"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Form 30 - Notice of Transfer by Buyer</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Road Tax Receipt
                    </label>
                    <input
                      type="file"
                      name="road-tax-receipt"
                      onChange={handleChange}
                      accept="application/pdf,image/*"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Address Proof (Aadhaar/DL/Passport)
                    </label>
                    <input
                      type="file"
                      name="address-proof"
                      onChange={handleChange}
                      accept="application/pdf,image/*"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VEHICLE HISTORY SECTION */}
          {activeSection === 'history' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-200">
                Vehicle History & Condition
              </h2>

              {/* Odometer Section */}
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
                  <i className="fas fa-tachometer-alt mr-2"></i>
                  Odometer & Service History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Current Odometer Reading (km) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="odometer-reading"
                      value={formData['odometer-reading']}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g., 45000"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Odometer Tampering Status
                    </label>
                    <select
                      name="odometer-tampering"
                      value={formData['odometer-tampering']}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="No Tampering">No Tampering - Original</option>
                      <option value="Suspected">Suspected Tampering</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 h-full items-end pb-2">
                      <input
                        type="checkbox"
                        name="odometer-verified"
                        checked={formData['odometer-verified'] === 'yes'}
                        onChange={handleChange}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="font-semibold text-gray-700">
                        Odometer Reading Verified by Mechanic?
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 h-full items-end pb-2">
                      <input
                        type="checkbox"
                        name="service-book-available"
                        checked={formData['service-book-available'] === 'yes'}
                        onChange={handleChange}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="font-semibold text-gray-700">
                        Service Book Available?
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Service History Records
                    </label>
                    <select
                      name="service-history"
                      value={formData['service-history']}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Complete Service Records">Complete Service Records</option>
                      <option value="Partial Records">Partial Records</option>
                      <option value="No Records">No Records Available</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Last Service Date
                    </label>
                    <input
                      type="date"
                      name="last-service-date"
                      value={formData['last-service-date']}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Accident History */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center">
                  <i className="fas fa-car-crash mr-2"></i>
                  Accident & Damage History
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="accident-history"
                        checked={formData['accident-history'] === 'yes'}
                        onChange={handleChange}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="font-semibold text-gray-700">
                        Vehicle involved in any accidents? <span className="text-red-500">*</span>
                      </span>
                    </label>
                  </div>

                  {formData['accident-history'] === 'yes' && (
                    <>
                      <div className="md:w-1/2">
                        <label className="block font-semibold text-gray-700 mb-2">
                          Number of Accidents
                        </label>
                        <input
                          type="number"
                          name="number-of-accidents"
                          value={formData['number-of-accidents']}
                          onChange={handleChange}
                          min="1"
                          placeholder="e.g., 1"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">
                          Accident Details
                        </label>
                        <textarea
                          name="accident-details"
                          value={formData['accident-details']}
                          onChange={handleChange}
                          rows="4"
                          placeholder="Describe the accidents - when, severity, parts damaged, repairs done, etc."
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="major-repairs"
                        checked={formData['major-repairs'] === 'yes'}
                        onChange={handleChange}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="font-semibold text-gray-700">
                        Any Major Repairs Done? (Engine, Transmission, Body)
                      </span>
                    </label>
                  </div>

                  {formData['major-repairs'] === 'yes' && (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">
                        Repair Details
                      </label>
                      <textarea
                        name="repair-details"
                        value={formData['repair-details']}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Describe major repairs - what was repaired, when, estimated cost, warranty status"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-orange-500 mt-1 mr-3"></i>
                  <div>
                    <h4 className="font-bold text-orange-800 mb-2">Important Declaration</h4>
                    <p className="text-sm text-gray-700">
                      All information provided above is accurate to the best of my knowledge. 
                      I understand that providing false information may result in legal action and 
                      cancellation of the auction. The vehicle will be inspected by a certified mechanic 
                      before auction approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation & Submit Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t-2 border-gray-200">
            <div className="flex gap-2">
              {activeSection !== 'basic' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeSection === 'documents') setActiveSection('basic');
                    if (activeSection === 'history') setActiveSection('documents');
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Previous
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {activeSection !== 'history' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeSection === 'basic') setActiveSection('documents');
                    else if (activeSection === 'documents') setActiveSection('history');
                  }}
                  className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Next Section
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle mr-2"></i>
                      Submit Auction Request
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Progress Indicator */}
        <div className="mt-4 flex justify-center gap-2">
          <div className={`w-3 h-3 rounded-full ${activeSection === 'basic' ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
          <div className={`w-3 h-3 rounded-full ${activeSection === 'documents' ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
          <div className={`w-3 h-3 rounded-full ${activeSection === 'history' ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddAuction;