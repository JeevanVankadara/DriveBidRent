// client/src/pages/buyer/AuctionDetails.jsx
import { useState, useEffect } from 'react';
import './AuctionDetails.css';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuctionById, placeBid, createOrGetChatForAuction } from '../../services/buyer.services';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCurrentBidder, setIsCurrentBidder] = useState(false);

  useEffect(() => {
    const fetchAuctionDetails = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const data = await getAuctionById(id);
        setAuction(data.auction);
        setCurrentBid(data.currentBid);
        setIsCurrentBidder(data.isCurrentBidder || false);
      } catch (error) {
        console.error('Error fetching auction details:', error);
        setError('Failed to load auction details');
      } finally {
        if (isInitial) setLoading(false);
      }
    };
    
    // Initial fetch with loading state
    fetchAuctionDetails(true);
    
    // Set up polling for real-time bid updates every 1 second (without loading state)
    const intervalId = setInterval(() => {
      if (!error) {
        fetchAuctionDetails(false);
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [id]);

  const fetchAuctionDetails = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await getAuctionById(id);
      setAuction(data.auction);
      setCurrentBid(data.currentBid);
      setIsCurrentBidder(data.isCurrentBidder || false);
    } catch (error) {
      console.error('Error fetching auction details:', error);
      setError('Failed to load auction details');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    
    if (isCurrentBidder) {
      setError('You already have the current bid for this auction');
      return;
    }

    if (auction?.auction_stopped) {
      setError('This auction has been stopped. Please check the auction details page.');
      return;
    }

    const bidValue = parseFloat(bidAmount);
    const minBid = calculateMinBid();

    if (isNaN(bidValue) || bidValue <= 0) {
      setError('Please enter a valid bid amount.');
      return;
    }

    if (bidValue < minBid) {
      setError(`Your bid must be at least ₹${minBid.toLocaleString()}.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const result = await placeBid({
        auctionId: id,
        bidAmount: bidValue
      });

      if (result.success) {
        setSuccess('Your bid has been placed successfully!');
        setBidAmount('');
        setCurrentBid({ bidAmount: bidValue });
        setIsCurrentBidder(true);
        fetchAuctionDetails();
      } else {
        setError(result.message || 'Failed to place bid. Please try again.');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateMinBid = () => {
    if (!auction) return 0;
    return currentBid ? currentBid.bidAmount + 2000 : auction.startingBid;
  };

  const handleBidAmountChange = (value) => {
    setBidAmount(value);
    setError('');
  };

  const handleContactSeller = async () => {
    try {
      setChatLoading(true);
      setError('');
      console.log('Attempting to create chat for auction:', id);
      const chat = await createOrGetChatForAuction(id);
      console.log('Chat result:', chat);
      if (chat) {
        navigate(`/buyer/chats/${chat._id}`);
      } else {
        setError('Unable to create chat. You may need to be logged in.');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create chat';
      setError(`Error: ${errorMessage}`);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!auction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-red-600 font-bold">Auction not found</div>
      </div>
    );
  }

  const minBid = calculateMinBid();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8 lg:py-12">

      {/* Hero Header */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[420px] bg-cover bg-center bg-no-repeat mb-6 sm:mb-10 lg:mb-16"
        style={{ backgroundImage: `url(${auction.vehicleImage})`, backgroundColor: '#1a1a1a' }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6">
          <div className="text-center max-w-4xl">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black text-white tracking-tight mb-2 sm:mb-4">
              {auction.vehicleName}
            </h1>
            {auction.carType && (
              <p className="text-lg sm:text-xl md:text-2xl text-blue-300 font-bold mb-2">
                {auction.carType}
              </p>
            )}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-orange-400 font-bold">
              Current Bid: ₹{currentBid ? currentBid.bidAmount.toLocaleString() : auction.startingBid.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">

        {/* Left Column - Auction Info */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-orange-100">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 mb-6 sm:mb-8">Auction Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-base sm:text-lg">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <p className="text-gray-600 font-semibold text-sm sm:text-base">Seller</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                    {auction.seller?.firstName} {auction.seller?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold text-sm sm:text-base">Year</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{auction.year}</p>
                </div>
                {auction.carType && (
                  <div>
                    <p className="text-gray-600 font-semibold text-sm sm:text-base">Car Type</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{auction.carType}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 font-semibold text-sm sm:text-base">Condition</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 capitalize">
                    {auction.condition}
                  </p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <p className="text-gray-600 font-semibold text-sm sm:text-base">Starting Bid</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                    ₹{auction.startingBid.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold text-sm sm:text-base">Auction Date</p>
                  <p className="text-base sm:text-lg lg:text-2xl font-bold text-orange-600 break-words">
                    {new Date(auction.auctionDate).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold text-sm sm:text-base">Current Highest Bid</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-orange-600">
                    {currentBid ? `₹${currentBid.bidAmount.toLocaleString()}` : 'No bids yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Documentation Highlights - For Buyers */}
          {auction.vehicleDocumentation && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border-2 border-blue-200">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700 mb-6 sm:mb-8">
                Vehicle Verification Report
              </h2>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                {/* Ownership */}
                <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100">
                  <div className="flex items-center mb-2">
                    <p className="font-bold text-gray-700 text-sm">Ownership</p>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{auction.vehicleDocumentation.ownershipType}</p>
                </div>

                {/* Insurance Status */}
                <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100">
                  <div className="flex items-center mb-2">
                    <p className="font-bold text-gray-700 text-sm">Insurance</p>
                  </div>
                  <p className={`text-lg font-bold ${auction.vehicleDocumentation.insuranceStatus === 'Valid' ? 'text-green-600' : 'text-red-600'}`}>
                    {auction.vehicleDocumentation.insuranceStatus}
                  </p>
                </div>

                {/* Accident History */}
                <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100">
                  <div className="flex items-center mb-2">
                    <p className="font-bold text-gray-700 text-sm">Accidents</p>
                  </div>
                  <p className={`text-lg font-bold ${auction.vehicleDocumentation.accidentHistory ? 'text-red-600' : 'text-green-600'}`}>
                    {auction.vehicleDocumentation.accidentHistory ? `${auction.vehicleDocumentation.numberOfAccidents} Reported` : 'No Accidents'}
                  </p>
                </div>

                {/* Odometer */}
                <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100">
                  <div className="flex items-center mb-2">
                    <p className="font-bold text-gray-700 text-sm">Odometer</p>
                  </div>
                  <p className="text-lg font-bold text-indigo-600">{auction.vehicleDocumentation.odometerReading?.toLocaleString()} km</p>
                  <p className={`text-xs font-semibold mt-1 ${auction.vehicleDocumentation.odometerTampering === 'No Tampering' ? 'text-green-600' : 'text-red-600'}`}>
                    {auction.vehicleDocumentation.odometerTampering === 'No Tampering' ? '✅ Verified' : '⚠️ ' + auction.vehicleDocumentation.odometerTampering}
                  </p>
                </div>

                {/* Loan Status */}
                <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100">
                  <div className="flex items-center mb-2">
                    <p className="font-bold text-gray-700 text-sm">Loan Status</p>
                  </div>
                  <p className={`text-sm font-bold ${auction.vehicleDocumentation.hypothecationStatus?.includes('Clear') ? 'text-green-600' : 'text-orange-600'}`}>
                    {auction.vehicleDocumentation.hypothecationStatus}
                  </p>
                </div>

                {/* Pollution Certificate */}
                <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100">
                  <div className="flex items-center mb-2">
                    <p className="font-bold text-gray-700 text-sm">PUC</p>
                  </div>
                  <p className={`text-lg font-bold ${auction.vehicleDocumentation.pollutionCertificate === 'Valid' ? 'text-green-600' : 'text-red-600'}`}>
                    {auction.vehicleDocumentation.pollutionCertificate}
                  </p>
                </div>
              </div>

              {/* Important Notices */}
              <div className="space-y-3">
                {auction.vehicleDocumentation.previousInsuranceClaims && (
                  <div className="bg-orange-100 border-l-4 border-orange-500 p-3 rounded">
                    <p className="text-sm font-semibold text-orange-800">
                      ⚠ This vehicle has previous insurance claims
                    </p>
                  </div>
                )}
                
                {auction.vehicleDocumentation.majorRepairs && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
                    <p className="text-sm font-semibold text-yellow-800">
                      Vehicle has undergone major repairs
                    </p>
                  </div>
                )}

                {!auction.vehicleDocumentation.readyForTransfer && (
                  <div className="bg-red-100 border-l-4 border-red-500 p-3 rounded">
                    <p className="text-sm font-semibold text-red-800">
                      Transfer documentation pending - verify before bidding
                    </p>
                  </div>
                )}

                {auction.vehicleDocumentation.stolenVehicleCheck === 'Verified Clean' && (
                  <div className="bg-green-100 border-l-4 border-green-500 p-3 rounded">
                    <p className="text-sm font-semibold text-green-800">
                      ✓ Vehicle verified - Not reported stolen
                    </p>
                  </div>
                )}
              </div>

              {/* Registration Info */}
              <div className="mt-6 bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-3">
                  Registration Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Registration No:</span>
                    <p className="font-bold text-blue-600 font-mono">{auction.vehicleDocumentation.registrationNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">State:</span>
                    <p className="font-bold text-gray-800">{auction.vehicleDocumentation.registrationState}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">VIN:</span>
                    <p className="font-mono text-xs text-gray-700">{auction.vehicleDocumentation.vinNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Service Records:</span>
                    <p className="font-bold text-gray-800">{auction.vehicleDocumentation.serviceHistory}</p>
                  </div>
                </div>
              </div>

              {/* Verification Badge */}
              {auction.vehicleDocumentation.documentsVerified && (
                <div className="mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 text-center">
                  <p className="text-lg font-bold">
                    ✓ DOCUMENTS VERIFIED BY AUCTION MANAGER
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Bid Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-orange-100 lg:sticky lg:top-24">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 mb-6 sm:mb-8 text-center">Place Your Bid</h2>

            {isCurrentBidder ? (
              <div className="bg-green-100 border-2 border-green-500 text-green-800 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 rounded-xl sm:rounded-2xl text-center text-lg sm:text-xl lg:text-2xl font-bold">
                You have the current highest bid!
              </div>
            ) : auction.auction_stopped ? (
              <div className="bg-red-100 border-2 border-red-500 text-red-800 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 rounded-xl sm:rounded-2xl text-center text-lg sm:text-xl lg:text-2xl font-bold">
                This auction has been stopped.
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-100 border border-red-500 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 text-center font-semibold text-sm sm:text-base">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-100 border border-green-500 text-green-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 text-center font-semibold text-sm sm:text-base">
                    {success}
                  </div>
                )}

                <form onSubmit={handleBidSubmit} className="space-y-6 sm:space-y-8">
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-700 mb-2 sm:mb-3">
                      Your Bid Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => handleBidAmountChange(e.target.value)}
                      required
                      min="0"
                      step="1000"
                      placeholder={`Minimum: ₹${minBid.toLocaleString()}`}
                      className="w-full px-4 sm:px-6 py-3 sm:py-5 text-lg sm:text-xl lg:text-2xl font-bold text-center border-2 border-orange-300 rounded-xl sm:rounded-2xl focus:border-orange-500 focus:ring-2 sm:focus:ring-4 focus:ring-orange-200 transition"
                    />
                    <p className="text-center mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
                      Minimum bid: <span className="font-bold text-orange-600">₹{minBid.toLocaleString()}</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg sm:text-xl lg:text-2xl font-black py-4 sm:py-5 lg:py-6 rounded-xl sm:rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Placing Bid...' : 'Place Bid Now'}
                  </button>
                </form>
              </>
            )}

            {/* Book Appointment Button */}
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
              <button
                onClick={handleContactSeller}
                disabled={chatLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-base sm:text-lg lg:text-xl font-bold py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {chatLoading ? 'Loading...' : 'Book an Appointment'}
              </button>
              <p className="text-center mt-3 text-xs sm:text-sm text-gray-500">
                Schedule a viewing or chat with the seller
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}