// client/src/pages/auctionManager/ViewBids.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';

export default function ViewBids() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [pastBids, setPastBids] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
          setLoading(true);
        const res = await auctionManagerServices.viewBids(id);
          const responseData = res.data || res;
        
          if (responseData.success) {
            setAuction(responseData.data.auction);
            setCurrentBid(responseData.data.currentBid);
            setPastBids(responseData.data.pastBids);
          } else {
            setError(responseData.message || 'Failed to load bids');
        }
      } catch (err) {
          console.error('View bids fetch error:', err);
          setError(err.response?.data?.message || 'Failed to load bids');
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, [id]);

  const stopAuction = async () => {
    try {
      const res = await auctionManagerServices.stopAuction(id);
        const responseData = res.data || res;
      
        if (responseData.success) {
        setMessage('Auction has been stopped.');
        setAuction({ ...auction, auction_stopped: true });
        } else {
          setMessage(responseData.message || 'Failed to stop auction');
      }
    } catch (err) {
        console.error('Stop auction error:', err);
        setMessage(err.response?.data?.message || 'Failed to stop auction');
    }
  };

  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;
  const formatDate = (date) => new Date(date).toLocaleString();

    if (loading) {
      return (
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">View Bids</h2>
          <div className="text-center py-10 text-xl text-gray-600">Loading bids...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">View Bids</h2>
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
            {error}
          </div>
          <div className="text-center mt-4">
            <Link to="/auction-manager/approved" className="text-blue-600 hover:text-blue-700 font-medium">
              Back to Approved Cars
            </Link>
          </div>
        </div>
      );
    }

    if (!auction) {
      return (
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">View Bids</h2>
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg text-center">
            Auction not found
          </div>
          <div className="text-center mt-4">
            <Link to="/auction-manager/approved" className="text-blue-600 hover:text-blue-700 font-medium">
              Back to Approved Cars
            </Link>
          </div>
        </div>
      );
    }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Auction Info */}
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-orange-600 mb-6">{auction.vehicleName}</h1>
        <img src={auction.vehicleImage} alt={auction.vehicleName} className="w-full max-w-sm rounded-lg mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
          <p><strong>Seller:</strong> {auction.sellerId.firstName} {auction.sellerId.lastName}</p>
          <p><strong>Email:</strong> {auction.sellerId.email}</p>
          <p><strong>City:</strong> {auction.sellerId.city}</p>
          <p><strong>Year:</strong> {auction.year}</p>
          <p><strong>Condition:</strong> {auction.condition}</p>
          <p><strong>Starting Bid:</strong> {formatCurrency(auction.startingBid)}</p>
        </div>
      </div>

      {/* Bids Section */}
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-orange-600">Bids on {auction.vehicleName}</h2>
          <div>
            <Link to="/auction-manager/approved" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition mr-2">
              Back to Cars
            </Link>
            {!auction.auction_stopped && auction.started_auction === 'yes' && (
              <button
                onClick={stopAuction}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition"
              >
                Stop Auction
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-center font-medium mb-6 ${message.includes('stopped') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {currentBid ? (
          <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-orange-600 mb-8">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {formatCurrency(currentBid.bidAmount)}
            </div>
            <div className="flex flex-wrap justify-between text-gray-700">
              <div>
                <strong>Bidder:</strong> {currentBid.buyerId.firstName} {currentBid.buyerId.lastName} ({currentBid.buyerId.email})
              </div>
              <div>
                <strong>Time:</strong> {formatDate(currentBid.bidTime)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600 italic">
            No bids have been placed yet.
          </div>
        )}

        {pastBids.length > 0 && (
          <>
            <h3 className="text-xl font-bold text-gray-700 mb-4">Bid History (Last 3)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pastBids.map((bid) => (
                <div key={bid._id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
                  <div className="text-xl font-bold text-blue-600 mb-2">
                    {formatCurrency(bid.bidAmount)}
                  </div>
                  <div className="text-sm text-gray-700">
                    <div>
                      <strong>Bidder:</strong> {bid.buyerId.firstName} {bid.buyerId.lastName} ({bid.buyerId.email})
                    </div>
                    <div>
                      <strong>Time:</strong> {formatDate(bid.bidTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}