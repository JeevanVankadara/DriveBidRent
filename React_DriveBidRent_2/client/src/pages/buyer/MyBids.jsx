import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBids } from '../../services/buyer.services';
import './MyBids.css'; // Add this CSS import

export default function MyBids() {
  const [auctionsWithBids, setAuctionsWithBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    try {
      const data = await getMyBids();
      console.log('MyBids data received:', data);
      setAuctionsWithBids(data);
    } catch (error) {
      console.error('Error fetching my bids:', error);
      setError('Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'ended': return 'status-ended';
      case 'pending': return 'status-pending';
      default: return 'status-active';
    }
  };

  if (loading) return <div className="text-center py-10">Loading your bids...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Bids</h1>
        <p>Track all the auctions you've participated in</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="bids-container">
        {auctionsWithBids.length > 0 ? (
          auctionsWithBids.map(auctionBid => (
            <div key={auctionBid.auction?._id} className="bid-card">
              <div className="bid-image">
                <img 
                  src={auctionBid.auction?.vehicleImage} 
                  alt={auctionBid.auction?.vehicleName}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Car+Image';
                  }}
                />
              </div>
              
              <div className="bid-content">
                <div className="bid-header">
                  <div className="vehicle-info">
                    <h3>{auctionBid.auction?.vehicleName}</h3>
                    <p className="seller-info">Seller: {auctionBid.seller?.firstName} {auctionBid.seller?.lastName}</p>
                  </div>

                  <div className={`bid-status ${getStatusClass(auctionBid.bidStatus)}`}>
                    {auctionBid.bidStatus?.charAt(0)?.toUpperCase() + auctionBid.bidStatus?.slice(1)}
                  </div>
                </div>

                <div className="bid-details">
                  <div className="detail-item">
                    <span className="detail-label">Your Highest Bid</span>
                    <span className="detail-value">
                      ₹{auctionBid.myHighestBid?.toLocaleString()}
                    </span>
                  </div>

                  {auctionBid.bidStatus === 'ended' && (
                    <div className="detail-item">
                      <span className="detail-label">Car's Highest Bid</span>
                      <span className="detail-value">
                        ₹{auctionBid.highestBid ? auctionBid.highestBid.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  )}

                  <div className="detail-item">
                    <span className="detail-label">Total Bids Placed</span>
                    <span className="detail-value">{auctionBid.totalBids}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Auction Status</span>
                    <span className="detail-value">
                      {auctionBid.bidStatus?.charAt(0)?.toUpperCase() + auctionBid.bidStatus?.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="bid-actions">
                  <Link 
                    to={`/buyer/auctions/${auctionBid.auction?._id}`}
                    className="btn btn-primary"
                  >
                    View Auction
                  </Link>

                  {auctionBid.bidStatus === 'active' && (
                    <Link 
                      to={`/buyer/auctions/${auctionBid.auction?._id}`}
                      className="btn btn-secondary"
                    >
                      Place New Bid
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-bids">
            <h3>No Bids Yet</h3>
            <p>You haven't participated in any auctions yet.</p>
            <Link to="/buyer/auctions" className="explore-link">
              Explore Available Auctions →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}