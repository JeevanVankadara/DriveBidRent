import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPurchaseDetails } from '../../services/buyer.services';

export default function PurchaseDetails() {
  const { id } = useParams();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseDetails();
  }, [id]);

  const fetchPurchaseDetails = async () => {
    try {
      const data = await getPurchaseDetails(id);
      setPurchase(data);
    } catch (error) {
      console.error('Error fetching purchase details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading purchase details...</div>;
  if (!purchase) return <div className="text-center py-10">Purchase not found</div>;

  return (
    <div>
      {/* Hero Section */}
      <div className="purchases-hero">
        <h1>Purchase <span className="oneL">Details</span></h1>
        <p>Detailed information about your vehicle purchase</p>
      </div>

      {/* Purchase Details Section */}
      <section className="purchase-details">
        <div className="details-container">
          {/* Vehicle Image and Basic Details */}
          <div className="vehicle-image">
            <img src={purchase.vehicleImage} alt={purchase.vehicleName} />
          </div>
          <div className="vehicle-info">
            <h1>{purchase.vehicleName}</h1>
            <p className="purchase-date">
              Purchased on: <strong>{new Date(purchase.purchaseDate).toLocaleDateString()}</strong>
            </p>
            <div className="vehicle-specs">
              <p><strong>Year:</strong> {purchase.year}</p>
              <p><strong>Mileage:</strong> {purchase.mileage} km</p>
              <p><strong>Purchase Price:</strong> ₹{purchase.purchasePrice?.toLocaleString()}</p>
              <p><strong>Condition:</strong> {purchase.auctionId?.condition?.charAt(0)?.toUpperCase() + purchase.auctionId?.condition?.slice(1)}</p>
              <p><strong>Fuel Type:</strong> {purchase.auctionId?.fuelType?.charAt(0)?.toUpperCase() + purchase.auctionId?.fuelType?.slice(1)}</p>
              <p><strong>Transmission:</strong> {purchase.auctionId?.transmission?.charAt(0)?.toUpperCase() + purchase.auctionId?.transmission?.slice(1)}</p>
              <p><strong>Payment Status:</strong> {purchase.paymentStatus?.charAt(0)?.toUpperCase() + purchase.paymentStatus?.slice(1)}</p>
            </div>
          </div>

          {/* Seller Details */}
          <div className="seller-details">
            <h2>Seller Information</h2>
            <p><strong>Name:</strong> {purchase.sellerName}</p>
            <p><strong>Email:</strong> {purchase.sellerId?.email}</p>
            <p><strong>Phone:</strong> {purchase.sellerId?.phone}</p>
            {purchase.sellerId?.city && purchase.sellerId?.state ? (
              <p><strong>Location:</strong> {purchase.sellerId.city}, {purchase.sellerId.state}</p>
            ) : (
              <p><strong>Location:</strong> Not specified</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <Link to="/buyer/purchases" className="back-btn">Back to Purchases</Link>
          </div>
        </div>
      </section>
    </div>
  );
}