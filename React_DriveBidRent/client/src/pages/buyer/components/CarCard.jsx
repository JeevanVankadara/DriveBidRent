import { Link } from 'react-router-dom';

export default function CarCard({ item, type, isInWishlist, onToggleWishlist }) {
  const getDetailsLink = () => {
    return type === 'auction' 
      ? `/buyer/auctions/${item._id}`
      : `/buyer/rentals/${item._id}`;
  };

  const getActionLink = () => {
    return type === 'auction'
      ? `/buyer/auctions/${item._id}/bid`
      : `/buyer/rentals/${item._id}/book`;
  };

  const getActionText = () => {
    return type === 'auction' ? 'Place Bid' : 'Rent Now';
  };

  return (
    <div className="car-card">
      {/* Tags */}
      {type === 'auction' && <span className="hot-tag">Hot</span>}
      {type === 'rental' && <span className="new-tag">New</span>}
      
      {/* Wishlist Button */}
      <button 
        className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
        onClick={onToggleWishlist}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isInWishlist ? '❤️' : '🤍'}
      </button>

      {/* Image */}
      <img 
        src={item.vehicleImage} 
        alt={item.vehicleName} 
        className="car-card-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300x200?text=Car+Image';
        }}
      />

      {/* Title */}
      <h3 className="car-card-title">{item.vehicleName}</h3>

      {/* Type-specific info */}
      {type === 'auction' && (
        <p className="auction-date">
          Auction on: <strong>{new Date(item.auctionDate).toLocaleDateString()}</strong>
        </p>
      )}
      {type === 'rental' && (
        <p className="rental-cost">
          Cost/day: <strong>₹{item.costPerDay}</strong>
        </p>
      )}

      {/* Details - Limited to essential info */}
      <div className="car-card-details">
        <div className="car-card-detail">
          <span className="detail-label">Year:</span>
          <span className="detail-value">{item.year}</span>
        </div>
        
        {type === 'auction' && (
          <>
            <div className="car-card-detail">
              <span className="detail-label">Mileage:</span>
              <span className="detail-value">{item.mileage} km</span>
            </div>
            <div className="car-card-detail">
              <span className="detail-label">Condition:</span>
              <span className="detail-value">
                {item.condition?.charAt(0)?.toUpperCase() + item.condition?.slice(1)}
              </span>
            </div>
          </>
        )}
        
        {type === 'rental' && (
          <>
            <div className="car-card-detail">
              <span className="detail-label">Capacity:</span>
              <span className="detail-value">{item.capacity} passengers</span>
            </div>
            <div className="car-card-detail">
              <span className="detail-label">AC:</span>
              <span className="detail-value">{item.AC === 'available' ? 'Yes' : 'No'}</span>
            </div>
          </>
        )}
      </div>

      {/* Price - More prominent */}
      <div className="car-card-price">
        {type === 'auction' ? `Starting at ₹${item.startingBid?.toLocaleString()}` : `₹${item.costPerDay}/day`}
      </div>

      {/* Action Buttons - Now properly positioned at bottom */}
      <div className="car-card-actions">
        <Link 
          to={getDetailsLink()} 
          className="view-details-btn"
        >
          View Details
        </Link>
        <Link 
          to={getDetailsLink()}  // Both buttons now go to the same page 
          className={type === 'auction' ? 'bid-btn' : 'rent-btn'}
        >
          {getActionText()}
        </Link>
      </div>
    </div>
  );
}