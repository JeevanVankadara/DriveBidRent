import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRentalById, bookRental } from '../../services/buyer.services';
import DatePickerModal from './components/modals/DatePickerModal';
import PaymentModal from './components/modals/PaymentModal';
import ProcessingModal from './components/modals/ProcessingModal';
import SuccessModal from './components/modals/SuccessModal';
import './components/buyer.css';

export default function RentalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDateModal, setShowDateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // State for rental details
  const [pickupDate, setPickupDate] = useState('');
  const [dropDate, setDropDate] = useState('');
  const [includeDriver, setIncludeDriver] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');

  useEffect(() => {
    fetchRentalDetails();
  }, [id]);

  const fetchRentalDetails = async () => {
    try {
      console.log('Fetching rental details for ID:', id);
      const data = await getRentalById(id);
      console.log('Rental data received:', data);
      
      if (!data) {
        setError('Rental not found');
        return;
      }
      
      setRental(data);
    } catch (error) {
      console.error('Error fetching rental details:', error);
      setError('Failed to load rental details');
    } finally {
      setLoading(false);
    }
  };

const handleDateSelect = (pickup, drop, driverIncluded) => {
  console.log('Date selection updated:', { pickup, drop, driverIncluded });
  setPickupDate(pickup);
  setDropDate(drop);
  setIncludeDriver(driverIncluded);
  
  // Calculate cost immediately to ensure PaymentModal gets correct value
  if (pickup && drop && rental) {
    const pickupDateObj = new Date(pickup);
    const dropDateObj = new Date(drop);
    const days = Math.ceil((dropDateObj - pickupDateObj) / (1000 * 60 * 60 * 24));
    const vehicleCost = days * rental.costPerDay;
    const driverCost = driverIncluded && rental.driverAvailable ? days * rental.driverRate : 0;
    const cost = vehicleCost + driverCost;
    
    console.log('Parent cost calculation:', { 
      days, 
      vehicleCost, 
      driverCost, 
      total: cost,
      driverIncluded 
    });
    setTotalCost(cost);
  }
};

  const handleRentNow = async () => {
    console.log('Proceeding to payment with:', { 
      pickupDate, 
      dropDate, 
      totalCost, 
      includeDriver,
      rentalId: id,
      sellerId: rental?.seller?._id
    });
    
    if (!pickupDate || !dropDate) {
      alert('Please select both pickup and drop dates.');
      return;
    }

    if (totalCost <= 0) {
      alert('Please select valid dates to calculate the cost.');
      return;
    }

    // Validate dates
    const pickupDateObj = new Date(pickupDate);
    const dropDateObj = new Date(dropDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickupDateObj < today) {
      alert('Pickup date cannot be in the past.');
      return;
    }

    if (dropDateObj <= pickupDateObj) {
      alert('Drop date must be after pickup date.');
      return;
    }

    setShowDateModal(false);
    setShowPaymentModal(true);
  };

  const handlePayment = async (paymentMethod) => {
    console.log('Processing payment with method:', paymentMethod);
    console.log('Booking data:', {
      rentalCarId: id,
      sellerId: rental.seller._id,
      pickupDate,
      dropDate,
      totalCost,
      includeDriver
    });

    setShowPaymentModal(false);
    setShowProcessingModal(true);

    try {
      const rentalData = {
        rentalCarId: id,
        sellerId: rental.seller._id,
        pickupDate,
        dropDate,
        totalCost,
        includeDriver
      };

      console.log('Sending booking request:', rentalData);

      const result = await bookRental(rentalData);
      console.log('Booking response:', result);
      
      if (result.success) {
        setTimeout(() => {
          setShowProcessingModal(false);
          setShowSuccessModal(true);
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to book rental');
      }
    } catch (error) {
      console.error('Error booking rental:', error);
      setShowProcessingModal(false);
      alert('Error booking rental: ' + (error.response?.data?.message || error.message || 'Please try again.'));
    }
  };

  const redirectToDashboard = () => {
    navigate('/buyer/dashboard');
  };

  const redirectToRentals = () => {
    navigate('/buyer/rentals');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading rental details...</p>
        </div>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="page-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>{error || 'Rental not found'}</h2>
          <p>The rental you're looking for doesn't exist or may have been removed.</p>
          <button className="btn btn-primary" onClick={redirectToRentals}>
            Back to Rentals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="rental-details">
        <div className="page-header">
          <h1>{rental.vehicleName}</h1>
          <p>Complete vehicle details and rental information</p>
        </div>

        <div className="rental-content">
          {/* Main Image Section */}
          <div className="rental-image-section">
            <img 
              src={rental.vehicleImage} 
              alt={rental.vehicleName}
              className="rental-main-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x400/4A5568/FFFFFF?text=Car+Image+Not+Available';
              }}
            />
          </div>
          
          {/* Quick Info Cards */}
          <div className="quick-info-cards">
            <div className="info-card">
              <div className="info-icon">📅</div>
              <div className="info-content">
                <span className="info-label">Year</span>
                <span className="info-value">{rental.year}</span>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">👥</div>
              <div className="info-content">
                <span className="info-label">Capacity</span>
                <span className="info-value">{rental.capacity} persons</span>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">⛽</div>
              <div className="info-content">
                <span className="info-label">Fuel</span>
                <span className="info-value">{rental.fuelType?.charAt(0)?.toUpperCase() + rental.fuelType?.slice(1)}</span>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">⚙️</div>
              <div className="info-content">
                <span className="info-label">Transmission</span>
                <span className="info-value">{rental.transmission?.charAt(0)?.toUpperCase() + rental.transmission?.slice(1)}</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="rental-main-grid">
            {/* Left Column - Specifications */}
            <div className="specs-column">
              <div className="specs-card">
                <h3>🚗 Vehicle Specifications</h3>
                <div className="specs-list">
                  <div className="spec-item">
                    <span className="spec-label">Manufacturing Year</span>
                    <span className="spec-value">{rental.year}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Vehicle Condition</span>
                    <span className="spec-value badge-condition">
                      {rental.condition?.charAt(0)?.toUpperCase() + rental.condition?.slice(1)}
                    </span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Seating Capacity</span>
                    <span className="spec-value">{rental.capacity} passengers</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Air Conditioning</span>
                    <span className="spec-value">
                      {rental.AC === 'available' ? (
                        <span className="badge-available">Available</span>
                      ) : (
                        <span className="badge-unavailable">Not Available</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="specs-card">
                <h3>🔧 Technical Details</h3>
                <div className="specs-list">
                  <div className="spec-item">
                    <span className="spec-label">Fuel Type</span>
                    <span className="spec-value">
                      {rental.fuelType === 'petrol' ? '⛽ Petrol' : '⛽ Diesel'}
                    </span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Transmission</span>
                    <span className="spec-value">
                      {rental.transmission === 'automatic' ? '⚙️ Automatic' : '⚙️ Manual'}
                    </span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Driver Option</span>
                    <span className="spec-value">
                      {rental.driverAvailable ? (
                        <span className="badge-available">Available</span>
                      ) : (
                        <span className="badge-unavailable">Self-drive Only</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Pricing & Seller Info */}
            <div className="info-column">
              {/* Pricing Card */}
              <div className="pricing-card highlight-card">
                <h3>💰 Pricing Details</h3>
                <div className="pricing-details">
                  <div className="price-item main-price">
                    <span className="price-label">Cost per day</span>
                    <span className="price-value">₹{rental.costPerDay}</span>
                  </div>
                  {rental.driverAvailable ? (
                    <>
                      <div className="price-item">
                        <span className="price-label">Driver Available</span>
                        <span className="price-value">Yes</span>
                      </div>
                      <div className="price-item">
                        <span className="price-label">Driver Rate</span>
                        <span className="price-value">₹{rental.driverRate}/day</span>
                      </div>
                    </>
                  ) : (
                    <div className="price-item">
                      <span className="price-label">Driver Available</span>
                      <span className="price-value badge-unavailable">No</span>
                    </div>
                  )}
                </div>
                
                <div className="rental-summary">
                  <div className="summary-item">
                    <span>Minimum rental period:</span>
                    <span>1 day</span>
                  </div>
                  <div className="summary-item">
                    <span>Security deposit:</span>
                    <span>₹5,000 (Refundable)</span>
                  </div>
                  <div className="summary-item">
                    <span>Free cancellation:</span>
                    <span>Within 24 hours</span>
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              <div className="seller-card">
                <h3>👤 Seller Information</h3>
                <div className="seller-details">
                  <div className="seller-item">
                    <span className="seller-label">Name</span>
                    <span className="seller-value">{rental.seller.firstName} {rental.seller.lastName}</span>
                  </div>
                  <div className="seller-item">
                    <span className="seller-label">Email</span>
                    <span className="seller-value">{rental.seller.email}</span>
                  </div>
                  {rental.seller.phone && (
                    <div className="seller-item">
                      <span className="seller-label">Phone</span>
                      <span className="seller-value">{rental.seller.phone}</span>
                    </div>
                  )}
                  {rental.seller.city && (
                    <div className="seller-item">
                      <span className="seller-label">Location</span>
                      <span className="seller-value">
                        {rental.seller.city}
                        {rental.seller.state && `, ${rental.seller.state}`}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="seller-verification">
                  <div className="verification-item">
                    <span className="verified-badge">✓</span>
                    <span>Email Verified</span>
                  </div>
                  <div className="verification-item">
                    <span className="verified-badge">✓</span>
                    <span>Phone Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="action-section">
          <div className="action-buttons">
            <button 
              className="btn btn-secondary btn-large"
              onClick={() => navigate('/buyer/rentals')}
            >
              ← Back to Rentals
            </button>
            <div className="primary-actions">
              <a 
                href={`mailto:${rental.seller.email}?subject=Inquiry about ${rental.vehicleName}&body=Hello, I am interested in renting your ${rental.vehicleName}. Please provide more details.`}
                className="btn btn-outline btn-large"
              >
                📧 Contact Seller
              </a>
              <button 
                className="btn btn-primary btn-large rent-now-btn"
                onClick={() => setShowDateModal(true)}
              >
                🚗 Rent Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <DatePickerModal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        onProceed={handleRentNow}
        onDateSelect={handleDateSelect}
        rental={rental}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onProcessPayment={handlePayment}
        totalCost={totalCost}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodSelect={setSelectedPaymentMethod}
      />

      <ProcessingModal
        isOpen={showProcessingModal}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onRedirect={redirectToDashboard}
        message="Rental booked successfully! You will receive a confirmation email shortly."
      />
    </div>
  );
}