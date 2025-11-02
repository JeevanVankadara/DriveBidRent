import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import axiosInstance from '../../utils/axiosInstance.util';

const ViewBids = () => {
  const { id } = useParams(); // auctionId
  const [auction, setAuction] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await axiosInstance.get(`/seller/view-bids/${id}`);
        if (response.data.success) {
          const data = response.data.data;
          setAuction(data.auction);
          setCurrentBid(data.currentBid);
          setBidHistory(data.bidHistory);
          if (data.auction.started_auction === 'ended' && data.currentBid) {
            setShowPopup(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBids();
  }, [id]);

  const closePopup = () => {
    setShowPopup(false);
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
          background-color: #ffffff;
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

        /* Bids List */
        .bids-list {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .bids-list h2 {
          color: #ff6b00;
          margin-bottom: 1rem;
        }

        .bids-list h3 {
          color: #333333;
          margin: 1rem 0;
          font-size: 1.2rem;
        }

        .bids-list ul {
          list-style: none;
          padding: 0;
        }

        .bids-list ul li {
          padding: 0.75rem 0;
          border-bottom: 1px solid #eee;
          color: #333333;
        }

        .bids-list ul li:last-child {
          border-bottom: none;
        }

        /* Buyer Info Section */
        .buyer-info {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .buyer-info h2 {
          color: #ff6b00;
          margin-bottom: 1rem;
        }

        .buyer-info p {
          margin: 0.5rem 0;
          color: #333333;
        }

        .buyer-info p strong {
          color: #555555;
        }

        /* Popup Styles */
        .popup-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          justify-content: center;
          align-items: center;
        }

        .popup-content {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          max-width: 500px;
          width: 90%;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .popup-content h2 {
          color: #ff6b00;
          margin-bottom: 1rem;
        }

        .popup-content p {
          color: #333;
          margin-bottom: 1rem;
        }

        .close-btn {
          background: #ff6b00;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .close-btn:hover {
          background: #e65c00;
        }
      `}</style>
      <Navbar currentPage="" />
      <section className="seller-dashboard">
        <h1>Bids on {auction ? capitalize(auction.vehicleName) : ''}</h1>
        
        {/* Bids List */}
        <div className="bids-list">
          <h2>Bids</h2>
          {/* Current Bid */}
          <h3>Current Bid</h3>
          <ul>
            {currentBid ? (
              <li>
                ₹{currentBid.bidAmount.toLocaleString('en-IN')} - Bidder: 
                <strong>{capitalize(currentBid.buyerId.firstName)} {capitalize(currentBid.buyerId.lastName)}</strong>
                ({formatDate(currentBid.bidTime)})
              </li>
            ) : (
              <li>No bids yet.</li>
            )}
          </ul>
          {/* Bid History */}
          <h3>Bid History (Last 3)</h3>
          <ul>
            {bidHistory.length > 0 ? (
              bidHistory.map((bid, index) => (
                <li key={index}>
                  ₹{bid.bidAmount.toLocaleString('en-IN')} - Bidder: 
                  <strong>{capitalize(bid.buyerId.firstName)} {capitalize(bid.buyerId.lastName)}</strong>
                  ({formatDate(bid.bidTime)})
                </li>
              ))
            ) : (
              <li>No past bids available.</li>
            )}
          </ul>
        </div>

        {/* Buyer Information Section (Shown only if auction has ended and there is a current bid) */}
        {auction.started_auction === 'ended' && currentBid && (
          <div className="buyer-info">
            <h2>Buyer Information</h2>
            <p><strong>Name:</strong> {capitalize(currentBid.buyerId.firstName)} {capitalize(currentBid.buyerId.lastName)}</p>
            <p><strong>Email:</strong> {currentBid.buyerId.email || 'Not specified'}</p>
            <p><strong>Contact Number:</strong> {currentBid.buyerId.phone || 'Not specified'}</p>
          </div>
        )}
      </section>

      {/* Popup for Auction Ended */}
      {showPopup && (
        <div className="popup-overlay" style={{display: 'flex'}}>
          <div className="popup-content">
            <h2>Auction Ended</h2>
            <p>The auction for {capitalize(auction.vehicleName)} has ended.</p>
            <p><strong>Final Bid Amount:</strong> ₹{currentBid.bidAmount.toLocaleString('en-IN')}</p>
            <p><strong>Winner:</strong> {capitalize(currentBid.buyerId.firstName)} {capitalize(currentBid.buyerId.lastName)} ({currentBid.buyerId.email})</p>
            <button className="close-btn" onClick={closePopup}>Close</button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ViewBids;