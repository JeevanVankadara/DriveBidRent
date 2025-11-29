// client/src/pages/buyer/RentalDetails.jsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getRentalById, bookRental, createOrGetChatForRental } from '../../services/buyer.services';
import DatePickerModal from './components/modals/DatePickerModal';
import PaymentModal from './components/modals/PaymentModal';
import ProcessingModal from './components/modals/ProcessingModal';
import SuccessModal from './components/modals/SuccessModal';

export default function RentalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDateModal, setShowDateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [pickupDate, setPickupDate] = useState("");
  const [dropDate, setDropDate] = useState("");
  const [includeDriver, setIncludeDriver] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi");

  useEffect(() => {
    fetchRentalDetails();
  }, [id]);

  useEffect(() => {
    if (location.state?.openRentModal && rental?.status === "available") {
      setShowDateModal(true);
    }
  }, [location.state, rental]);

  const fetchRentalDetails = async () => {
    try {
      setLoading(true);
      const data = await getRentalById(id);
      setRental(data);
    } catch (error) {
      console.error("Error fetching rental details:", error);
      setError("Failed to load rental details");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (pickup, drop, driverIncluded) => {
    setPickupDate(pickup);
    setDropDate(drop);
    setIncludeDriver(driverIncluded);

    if (pickup && drop && rental) {
      const days = Math.ceil((new Date(drop) - new Date(pickup)) / (1000 * 60 * 60 * 24));
      const baseCost = days * (rental.costPerDay ?? 0);
      const driverCost = driverIncluded && rental.driverAvailable ? days * rental.driverRate : 0;
      setTotalCost(baseCost + driverCost);
    }
  };

  const handleRentNow = () => {
    if (rental?.status !== "available") return;
    if (!pickupDate || !dropDate) return alert("Please select both pickup and drop dates.");
    if (totalCost <= 0) return alert("Invalid rental period.");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(pickupDate) < today) return alert("Pickup date cannot be in the past.");
    if (new Date(dropDate) <= new Date(pickupDate)) return alert("Drop date must be after pickup date.");

    setShowDateModal(false);
    setShowPaymentModal(true);
  };

  const handlePayment = async (paymentMethod) => {
    setShowPaymentModal(false);
    setShowProcessingModal(true);

    try {
      const rentalData = {
        rentalCarId: id,
        sellerId: rental.seller._id,
        pickupDate,
        dropDate,
        totalCost,
        includeDriver,
      };

      const result = await bookRental(rentalData);

      if (result.success) {
        setTimeout(() => {
          setShowProcessingModal(false);
          setShowSuccessModal(true);
        }, 2000);
      } else {
        throw new Error(result.message || "Booking failed");
      }
    } catch (error) {
      setShowProcessingModal(false);
      alert("Booking failed: " + (error.response?.data?.message || error.message));
    }
  };

  const originPath = location.state?.from || "/buyer/rentals";
  const originLabel = useMemo(() => {
    const labels = {
      "/buyer": "← Back to Dashboard",
      "/buyer/rentals": "← Back to Rentals",
      "/buyer/purchases": "← Back to Purchases",
      "/buyer/wishlist": "← Back to Wishlist"
    };
    return labels[originPath] || "← Back";
  }, [originPath]);

  const isAvailable = rental?.status === "available";

  const redirectToDashboard = () => navigate("/buyer");
  const redirectBack = () => navigate(originPath);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-orange-600">Loading rental details...</p>
        </div>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-12 bg-white rounded-3xl shadow-2xl max-w-md">
          <div className="text-6xl mb-6">Warning</div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">{error || "Rental Not Found"}</h2>
          <p className="text-gray-600 mb-8">The rental you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={redirectBack}
            className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg mt-6"
          >
            {originLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Main Container */}
      <div className="max-w-4xl mx-auto py-8 px-4 md:px-6">

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">

          {/* Hero Image */}
          <div className="relative h-64 md:h-80">
            <img
              src={rental.vehicleImage}
              alt={rental.vehicleName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">

            {/* Title and Price */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{rental.vehicleName}</h1>
                <p className="text-2xl font-bold text-orange-600">₹{rental.costPerDay}/day</p>
              </div>
              {!isAvailable && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold text-sm">
                  Not Available
                </div>
              )}
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Year</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{rental.year}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Capacity</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{rental.capacity} seats</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Fuel</p>
                <p className="text-xl font-bold text-gray-900 capitalize mt-1">{rental.fuelType}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Transmission</p>
                <p className="text-xl font-bold text-gray-900 capitalize mt-1">{rental.transmission}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">Condition</span>
                    <span className="text-gray-900 font-semibold capitalize">{rental.condition}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">AC</span>
                    <span className="text-gray-900 font-semibold">{rental.AC === 'available' ? '✓ Yes' : '✗ No'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700 font-medium">Driver</span>
                    <span className="text-gray-900 font-semibold">{rental.driverAvailable ? '✓ Available' : 'Self-Drive Only'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Seller Information</h3>
                <div className="space-y-3">
                  <div className="py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-600 font-medium mb-1">Name</p>
                    <p className="text-gray-900 font-semibold">{rental.seller.firstName} {rental.seller.lastName}</p>
                  </div>
                  <div className="py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-600 font-medium mb-1">Location</p>
                    <p className="text-gray-900 font-semibold">{rental.seller.city}</p>
                  </div>
                  <div className="py-2">
                    <p className="text-sm text-gray-600 font-medium mb-1">Contact</p>
                    <p className="text-gray-900 font-semibold">{rental.seller.email}</p>
                    {rental.seller.phone && <p className="text-gray-900 font-semibold">{rental.seller.phone}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Side by Side */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => isAvailable && setShowDateModal(true)}
                disabled={!isAvailable}
                className={`flex-1 text-white font-bold py-3 rounded-lg transition ${
                  isAvailable
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Rent This Car
              </button>
              <button
                onClick={async () => {
                  try {
                    const chat = await createOrGetChatForRental(id);
                    if (chat && chat._id) {
                      navigate(`/buyer/chats/${chat._id}`);
                    } else {
                      alert('Unable to open chat with seller. Please try again later.');
                    }
                  } catch (err) {
                    console.error('Contact seller (rental) error:', err);
                    alert('Unable to open chat.');
                  }
                }}
                className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition"
              >
                Contact Seller
              </button>
            </div>

            {/* Back Button */}
            <div className="text-center">
              <button
                onClick={redirectBack}
                className="text-orange-600 font-bold hover:text-orange-700 transition"
              >
                {originLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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

      <ProcessingModal isOpen={showProcessingModal} />

      <SuccessModal
        isOpen={showSuccessModal}
        onRedirect={redirectToDashboard}
        message="Rental booked successfully!"
      />
    </div>
  );
}