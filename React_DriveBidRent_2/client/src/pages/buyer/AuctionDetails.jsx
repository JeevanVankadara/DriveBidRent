import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAuctionById, placeBid } from '../../services/buyer.services';
import './AuctionDetails.css';

export default function AuctionDetails() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCurrentBidder, setIsCurrentBidder] = useState(false);

  useEffect(() => {
    fetchAuctionDetails();
  }, [id]);

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      const data = await getAuctionById(id);
      setAuction(data.auction);
      setCurrentBid(data.currentBid);
      setIsCurrentBidder(data.isCurrentBidder || false);
    } catch (error) {
      console.error('Error fetching auction details:', error);
      setError('Failed to load auction details');
    } finally {
      setLoading(false);
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

      // FIXED: Pass as object matching placeBid function expectation
      const result = await placeBid({
        auctionId: id,
        bidAmount: bidValue
      });

      if (result.success) {
        setSuccess('Your bid has been placed successfully!');
        setBidAmount('');
        
        // Update current bid and refresh data
        setCurrentBid({ bidAmount: bidValue });
        setIsCurrentBidder(true);
        
        // Refresh auction details to get updated data
        fetchAuctionDetails();
      } else {
        setError(result.message || 'Failed to place bid. Please try again.');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      // Better error logging
      console.log('Full error details:', error);
      console.log('Error response:', error.response?.data);
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

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading auction details...</div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container">
        <div className="error-message">Auction not found</div>
      </div>
    );
  }

  const minBid = calculateMinBid();

  return (
    <div className="container">
      {/* Auction Details Section */}
      <div className="auction-details">
        <img 
          src={auction.vehicleImage} 
          alt={auction.vehicleName}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/800x400?text=Car+Image+Not+Available';
          }}
        />
        <h1>{auction.vehicleName}</h1>
        <p><strong>Seller:</strong> {auction.seller?.firstName} {auction.seller?.lastName}</p>
        <p><strong>Year:</strong> {auction.year}</p>
        <p><strong>Condition:</strong> {auction.condition?.charAt(0)?.toUpperCase() + auction.condition?.slice(1)}</p>
        <p><strong>Starting Bid:</strong> ₹{auction.startingBid?.toLocaleString()}</p>
        <p><strong>Auction Date:</strong> {new Date(auction.auctionDate).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
        <p className="current-bid">
          <strong>Current Bid:</strong>
          {currentBid ? (
            `₹${currentBid.bidAmount.toLocaleString()}`
          ) : (
            'No bids yet'
          )}
        </p>
      </div>

      {/* Bid Form Section */}
      <div className="bid-form">
        <h2>Place Your Bid</h2>
        
        {isCurrentBidder ? (
          <div className="error-message">
            You already have the current bid for this auction.
          </div>
        ) : auction.auction_stopped ? (
          <div className="error-message">
            This auction has been stopped. Please check the auction details page.
          </div>
        ) : (
          <>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleBidSubmit}>
              <input type="hidden" name="auctionId" value={id} />
              <div className="form-group">
                <label htmlFor="bidAmount">Your Bid Amount (₹)</label>
                <input 
                  type="number" 
                  id="bidAmount" 
                  name="bidAmount" 
                  value={bidAmount}
                  onChange={(e) => handleBidAmountChange(e.target.value)}
                  required 
                  min="0" 
                  step="1"
                  placeholder={`Minimum bid: ₹${minBid.toLocaleString()}`}
                />
              </div>
              <button 
                type="submit" 
                className="bid-btn"
                disabled={submitting}
              >
                {submitting ? 'Placing Bid...' : 'Place Bid'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}