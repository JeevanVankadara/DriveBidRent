import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import axiosInstance from '../../utils/axiosInstance.util';
import { useNavigate } from 'react-router-dom';

const ViewAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const capitalize = (str) => {
    if (!str || typeof str !== 'string') return 'Not specified';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    try {
      return new Date(date).toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axiosInstance.get('/seller/view-auctions');
        if (response.data.success) {
          setAuctions(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to load auction data');
      }
    };
    fetchAuctions();
  }, []);

  const openModal = (auctionId) => {
    const auction = auctions.find(a => a._id === auctionId);
    setSelectedAuction(auction);
  };

  const closeModal = () => {
    setSelectedAuction(null);
  };

  const showAlert = (message) => {
    setAlertMessage(message);
  };

  const closeAlertModal = () => {
    setAlertMessage(null);
  };

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

        /* Seller Dashboard Content */
        .seller-dashboard {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .seller-dashboard h1 {
          color: #ff6b00;
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        /* Auction cards grid */
        .auction-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }

        .auction-card {
          background-color: #ffffff;
          border-radius: 1rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }

        .auction-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .auction-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        .auction-info {
          padding: 1.2rem;
        }

        .auction-title {
          font-size: 1.3rem;
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

        /* Details modal */
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 100;
          overflow-y: auto;
        }

        .modal-content {
          background-color: #fff;
          margin: 5% auto;
          width: 90%;
          max-width: 900px;
          border-radius: 1rem;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #ff6b00, #ff9a44);
          color: white;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .close {
          font-size: 1.8rem;
          font-weight: bold;
          cursor: pointer;
        }

        .close:hover {
          color: #f0f0f0;
        }

        .modal-body {
          padding: 1.5rem;
          display: flex;
          flex-wrap: wrap;
        }

        .vehicle-image-container {
          flex: 1;
          min-width: 300px;
        }

        .vehicle-details-container {
          flex: 1;
          min-width: 300px;
          padding-left: 2rem;
        }

        .vehicle-image {
          width: 100%;
          max-width: 400px;
          border-radius: 0.5rem;
        }

        .vehicle-name {
          font-size: 1.8rem;
          font-weight: 600;
          color: #ff6b00;
          margin-bottom: 0.5rem;
        }

        .detail-item {
          display: flex;
          margin-bottom: 0.8rem;
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
          margin-top: 1rem;
          cursor: pointer;
        }

        .card-btn:hover {
          background: linear-gradient(135deg, #ff9a44, #ff6b00);
        }

        .no-auctions {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .mechanic-info {
          background-color: #f0f8ff;
          border-left: 4px solid #1e90ff;
          padding: 1rem;
          margin-top: 1.5rem;
          border-radius: 0.5rem;
        }

        .mechanic-info h3 {
          color: #1e90ff;
          margin-bottom: 0.5rem;
        }

        .mechanic-info p {
          margin-bottom: 0.5rem;
        }

        .alert-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 101;
        }

        .alert-modal-content {
          background-color: #fff;
          margin: 20% auto;
          width: 90%;
          max-width: 500px;
          border-radius: 1rem;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .alert-modal-header {
          background: linear-gradient(135deg, #ff6b00, #ff9a44);
          color: white;
          padding: 1rem 1.5rem;
          text-align: center;
        }

        .alert-modal-body {
          padding: 1.5rem;
          text-align: center;
        }

        .alert-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          float: right;
          color: white;
        }
      `}</style>
      <Navbar currentPage="profile" />
      <div className="seller-dashboard">
        <h1>My Auctions</h1>

        {error && (
          <div style={{background: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem'}}>
            {error}
          </div>
        )}

        {auctions.length > 0 ? (
          <div className="auction-grid">
            {auctions.map(auction => (
              <div key={auction._id} className="auction-card" onClick={() => openModal(auction._id)}>
                <img src={auction.vehicleImage} alt={auction.vehicleName} className="auction-image" />
                <div className="auction-info">
                  <h3 className="auction-title">{capitalize(auction.vehicleName)}</h3>
                  <p><strong>Year:</strong> {auction.year}</p>
                  <p><strong>Status:</strong> <span className={`status-${auction.status}`}>{capitalize(auction.status)}</span></p>
                  {auction.status === 'assignedMechanic' && auction.assignedMechanic && (
                    <p><strong>Mechanic:</strong> {auction.assignedMechanic.firstName} {auction.assignedMechanic.lastName}</p>
                  )}
                  <p><strong>Auction Date:</strong> {formatDate(auction.auctionDate)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-auctions">
            <h2>No Auctions Found</h2>
            <p>You haven't created any auctions yet.</p>
            <Link to="/seller/add-auction" className="card-btn">Create New Auction</Link>
          </div>
        )}
      </div>

      {/* Vehicle Details Modal */}
      {selectedAuction && (
        <div className="modal" style={{display: 'block'}}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{selectedAuction.name}</h2>
              <span className="close" onClick={closeModal}>&times;</span>
            </div>
            <div className="modal-body">
              <div className="vehicle-image-container">
                <img src={selectedAuction.image} alt="Vehicle" className="vehicle-image" />
              </div>
              <div className="vehicle-details-container">
                <div className="vehicle-status-container">
                  <span className={`status-${selectedAuction.status}`}>{capitalize(selectedAuction.status)}</span>
                  <span>{selectedAuction.started_auction === 'yes' ? 'Started' : selectedAuction.started_auction === 'ended' ? 'Ended' : 'Not Started'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Year:</span>
                  <span className="detail-value">{selectedAuction.year}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Mileage:</span>
                  <span className="detail-value">{selectedAuction.mileage}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fuel Type:</span>
                  <span className="detail-value">{selectedAuction.fuelType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Transmission:</span>
                  <span className="detail-value">{selectedAuction.transmission}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Condition:</span>
                  <span className="detail-value">{selectedAuction.condition}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Auction Date:</span>
                  <span className="detail-value">{formatDate(selectedAuction.auctionDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Starting Bid:</span>
                  <span className="detail-value">{selectedAuction.startingBid}</span>
                </div>
                <div>
                  <Link to={`/seller/view-bids/${selectedAuction.id}`} className="card-btn">View Bids</Link>
                </div>
                {selectedAuction.status === 'assignedMechanic' && selectedAuction.mechanic.name !== 'Not assigned' && (
                  <div className="mechanic-info">
                    <h3>Assigned Mechanic</h3>
                    <p><strong>Name:</strong> {selectedAuction.mechanic.name}</p>
                    <p><strong>Address:</strong> {selectedAuction.mechanic.address}</p>
                    <p><strong>Instruction:</strong> Please send the car to the specified mechanic for inspection.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertMessage && (
        <div className="alert-modal" style={{display: 'block'}}>
          <div className="alert-modal-content">
            <div className="alert-modal-header">
              <span className="alert-close" onClick={closeAlertModal}>&times;</span>
              <h3>Information</h3>
            </div>
            <div className="alert-modal-body">
              <p>{alertMessage}</p>
              <button className="card-btn" onClick={closeAlertModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ViewAuctions;