import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';

const AuctionDetails = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [error, setError] = useState(null);

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'Not specified';

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await axiosInstance.get(`/seller/auction-details/${id}`);
        if (response.data.success) {
          setAuction(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to load auction details');
      }
    };
    fetchAuction();
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!auction) return <div>Loading...</div>;

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap");

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Montserrat", sans-serif;
        }

        body {
          background-color: #f8f8f8;
          color: #333333;
        }

        /* Vehicle Details Content */
        .vehicle-details {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .vehicle-details h1 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 2rem;
          color: #ff6b00;
          text-decoration: none;
          font-weight: 500;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .details-container {
          background-color: #ffffff;
          border-radius: 1rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .details-header {
          background: linear-gradient(135deg, #ff6b00, #ff9a44);
          color: white;
          padding: 1.5rem 2rem;
        }

        .details-body {
          padding: 2rem;
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .image-section {
          flex: 1;
          min-width: 300px;
        }

        .info-section {
          flex: 1;
          min-width: 300px;
        }

        .vehicle-image {
          width: 100%;
          max-width: 500px;
          border-radius: 0.5rem;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .vehicle-name-status {
          margin-top: 1.5rem;
        }

        .vehicle-name {
          font-size: 1.8rem;
          font-weight: 600;
          color: #ff6b00;
          margin-bottom: 0.5rem;
        }

        /* Status styling */
        .status-pending {
          color: #FFA500;
          font-weight: bold;
        }

        .status-approved {
          color: #008000;
          font-weight: bold;
        }

        .status-rejected {
          color: #FF0000;
          font-weight: bold;
        }

        .status-assignedMechanic {
          color: #1E90FF;
          font-weight: bold;
        }

        .details-list {
          margin-top: 0.5rem;
        }

        .detail-item {
          display: flex;
          margin-bottom: 1rem;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 1rem;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 600;
          width: 160px;
        }

        .detail-value {
          flex: 1;
        }

        .card-btn {
          display: inline-block;
          background: linear-gradient(135deg, #ff6b00, #ff9a44);
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.3s ease;
          margin-top: 1.5rem;
        }

        .card-btn:hover {
          background: linear-gradient(135deg, #ff9a44, #ff6b00);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .details-body {
            flex-direction: column;
          }
        }
      `}</style>
      <section className="vehicle-details">
        <Link to="/seller/view-auctions" className="back-link">
          &larr; Back to All Auctions
        </Link>
        
        <div className="details-container">
          <div className="details-header">
            <h1>{auction.vehicleName || 'Vehicle Details'}</h1>
          </div>
          
          <div className="details-body">
            <div className="image-section">
              <img 
                src={auction.vehicleImage || 'https://via.placeholder.com/500x350?text=No+Image'} 
                alt={auction.vehicleName || 'Vehicle image'} 
                className="vehicle-image"
              />
              <div className="vehicle-name-status">
                <h2 className="vehicle-name">{auction.vehicleName || 'Unnamed Vehicle'}</h2>
                <p>
                  <strong>Status:</strong> 
                  <span className={`status-${auction.status || 'pending'}`}>
                    {capitalize(auction.status || 'pending')}
                  </span>
                </p>
                {auction.status === 'pending' && (
                  <p className="status-pending">Your request is under review</p>
                )}
              </div>
            </div>
            
            <div className="info-section">
              <div className="details-list">
                <div className="detail-item">
                  <span className="detail-label">Year:</span>
                  <span className="detail-value">{auction.year || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Mileage:</span>
                  <span className="detail-value">{auction.mileage ? `${auction.mileage} km` : 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fuel Type:</span>
                  <span className="detail-value">{capitalize(auction.fuelType || 'Not specified')}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Transmission:</span>
                  <span className="detail-value">{capitalize(auction.transmission || 'Not specified')}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Condition:</span>
                  <span className="detail-value">{capitalize(auction.condition || 'Not specified')}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Auction Date:</span>
                  <span className="detail-value">{formatDate(auction.auctionDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Starting Bid:</span>
                  <span className="detail-value">{auction.startingBid ? `₹${auction.startingBid}` : 'Not specified'}</span>
                </div>
              </div>
              
              {(auction.status === 'approved' || auction.status === 'assignedMechanic') && (
                <Link to={`/seller/view-bids/${auction._id}`} className="card-btn">View Bids</Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AuctionDetails;