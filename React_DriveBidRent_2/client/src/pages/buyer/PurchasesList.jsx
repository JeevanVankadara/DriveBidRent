import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPurchases, getAuctionPaymentDetails, completeAuctionPayment } from '../../services/buyer.services';
import PaymentModal from './components/modals/PaymentModal';

export default function PurchasesList() {
  const [auctionPurchases, setAuctionPurchases] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const data = await getPurchases();
      setAuctionPurchases(data.auctionPurchases || []);
      setRentals(data.rentals || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (purchase) => {
    try {
      const details = await getAuctionPaymentDetails(purchase.auctionId);
      if (details) {
        setPaymentDetails(details);
        setSelectedPurchase(purchase);
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      alert('Failed to load payment details');
    }
  };

  const handlePayment = async (paymentMethod) => {
    try {
      const result = await completeAuctionPayment(selectedPurchase._id, paymentMethod);
      if (result.success) {
        alert('Payment successful! Contact the seller for further details.');
        setShowPaymentModal(false);
        fetchPurchases(); // Refresh the list
      } else {
        alert(result.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  if (loading) return <div className="text-center py-10">Loading purchases...</div>;

  return (
    <div>
      {/* Hero Section */}
      <div className="purchases-hero">
        <h1>My <span className="oneL">Purchases</span></h1>
        <p>Track and manage all your vehicle transactions</p>
      </div>

      {/* Auction Purchases Section */}
      <section className="purchases-section">
        <h2>Auction Purchases</h2>
        {auctionPurchases.length > 0 ? (
          <div className="card-container">
            {auctionPurchases.map(purchase => (
              <div key={purchase._id} className="car-card">
                <span className={`status-tag ${purchase.paymentStatus === 'pending' ? 'pending' : 'purchased'}`}>
                  {purchase.paymentStatus === 'pending' ? 'Pending Payment' : 'Purchased'}
                </span>
                <img src={purchase.vehicleImage} alt={purchase.vehicleName} />
                <h3>{purchase.vehicleName}</h3>
                <p className="purchase-date">
                  Purchased on: <strong>{new Date(purchase.purchaseDate).toLocaleDateString()}</strong>
                </p>
                <div className="car-details">
                  <p><strong>Year:</strong> {purchase.year}</p>
                  <p><strong>Mileage:</strong> {purchase.mileage} km</p>
                  <p><strong>Purchase Price:</strong> ₹{purchase.purchasePrice?.toLocaleString()}</p>
                  <p><strong>Seller:</strong> {purchase.sellerName}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/buyer/purchases/${purchase._id}`} className="details-btn">
                    More Details
                  </Link>
                  {purchase.paymentStatus === 'pending' && (
                    <button 
                      className="pay-now-btn"
                      onClick={() => handlePayNow(purchase)}
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't purchased any vehicles from auctions yet.</p>
        )}
      </section>

      {/* Current Rentals Section */}
      <section className="rentals-section">
        <h2>Current Rentals</h2>
        {rentals.length > 0 ? (
          <div className="card-container">
            {rentals.map(rental => (
              <div key={rental._id} className="car-card">
                <span className="status-tag active">Active</span>
                <img src={rental.vehicleImage} alt={rental.vehicleName} />
                <h3>{rental.vehicleName}</h3>
                <p className="rental-period">
                  Period: <strong>
                    {new Date(rental.pickupDate).toLocaleDateString()} - {new Date(rental.dropDate).toLocaleDateString()}
                  </strong>
                </p>
                <div className="car-details">
                  <p><strong>Daily Rate:</strong> ₹{rental.costPerDay}</p>
                  <p><strong>Total Cost:</strong> ₹{rental.totalCost}</p>
                  <p><strong>Seller:</strong> {rental.sellerName}</p>
                  <p><strong>Contact:</strong> {rental.sellerPhone}</p>
                </div>
                <Link to={`/buyer/rental-details/${rental._id}`} className="details-btn">
                  Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666' }}>You don't have any active rentals.</p>
        )}
      </section>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPayment={handlePayment}
        paymentDetails={paymentDetails}
        type="auction"
      />
    </div>
  );
}