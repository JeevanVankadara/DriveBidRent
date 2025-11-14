import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../../services/buyer.services';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState({ auctions: [], rentals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromAuctionWishlist = async (id) => {
    try {
      await removeFromWishlist(id, 'auction');
      setWishlist(prev => ({
        ...prev,
        auctions: prev.auctions.filter(item => item._id !== id)
      }));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const removeFromRentalWishlist = async (id) => {
    try {
      await removeFromWishlist(id, 'rental');
      setWishlist(prev => ({
        ...prev,
        rentals: prev.rentals.filter(item => item._id !== id)
      }));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading wishlist...</div>;

  return (
    <div>
      {/* Wishlist Hero Section */}
      <section className="wishlist-hero">
        <h1>Your <span className="highlight">Wishlist</span></h1>
        <p>All your favorite auctions and rentals in one place.</p>
      </section>

      {/* Wishlist - Auctions */}
      <section className="wishlist">
        <h1>Wishlist - Auctions</h1>
        <div className="card-container" id="auction-wishlist">
          {wishlist.auctions.length > 0 ? (
            wishlist.auctions.map(auction => (
              <div key={auction._id} className="car-card" data-id={auction._id}>
                <button 
                  className="heart-btn" 
                  data-liked="true" 
                  onClick={() => removeFromAuctionWishlist(auction._id)}
                >
                  ❤
                </button>
                <img src={auction.vehicleImage} alt={auction.vehicleName} />
                <h3>{auction.vehicleName}</h3>
                <p className="auction-date">
                  Auction on: <strong>{new Date(auction.auctionDate).toLocaleDateString()}</strong>
                </p>
                <div className="car-details">
                  <p><strong>Year:</strong> {auction.year}</p>
                  <p><strong>Mileage:</strong> {auction.mileage} km</p>
                  <p><strong>Condition:</strong> {auction.condition?.charAt(0)?.toUpperCase() + auction.condition?.slice(1)}</p>
                  <p><strong>Starting Price:</strong> ₹{auction.startingBid?.toLocaleString()}</p>
                  {auction.sellerId && (
                    <p><strong>Seller:</strong> {auction.sellerId.firstName} {auction.sellerId.lastName}</p>
                  )}
                </div>
                <div className="button-container">
                  <Link to={`/buyer/auctions/${auction._id}`} className="details-btn">View more</Link>
                  <Link to={`/buyer/auctions/${auction._id}`} className="placebid-btn">Place a bid</Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-items"><p>No auctions in your wishlist yet.</p></div>
          )}
        </div>
      </section>

      {/* Wishlist - Rentals */}
      <section className="wishlist-rentals">
        <h1>Wishlist - Rentals</h1>
        <div className="card-container" id="rental-wishlist">
          {wishlist.rentals.length > 0 ? (
            wishlist.rentals.map(rental => (
              <div key={rental._id} className="car-card" data-id={rental._id}>
                <button 
                  className="heart-btn" 
                  data-liked="true" 
                  onClick={() => removeFromRentalWishlist(rental._id)}
                >
                  ❤
                </button>
                <img src={rental.vehicleImage} alt={rental.vehicleName} />
                <h3>{rental.vehicleName}</h3>
                <p className="rental-cost">Cost/day: <strong>₹{rental.costPerDay}</strong></p>
                <div className="car-details">
                  {rental.sellerId?.city && (
                    <p><strong>City:</strong> {rental.sellerId.city}</p>
                  )}
                  <p><strong>Year:</strong> {rental.year}</p>
                  <p><strong>AC:</strong> {rental.AC === 'available' ? 'Yes' : 'No'}</p>
                  <p><strong>Capacity:</strong> {rental.capacity} passengers</p>
                  <p><strong>Driver:</strong> {rental.driverAvailable ? 'Yes' : 'No'}</p>
                  {rental.sellerId && (
                    <p><strong>Seller:</strong> {rental.sellerId.firstName} {rental.sellerId.lastName}</p>
                  )}
                </div>
                <div className="button-container">
                  <Link to={`/buyer/rentals/${rental._id}`} className="details-btn">View more</Link>
                  <Link to={`/buyer/rentals/${rental._id}/book`} className="rent-btn">Rent it</Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-items"><p>No rentals in your wishlist yet.</p></div>
          )}
        </div>
      </section>
    </div>
  );
}