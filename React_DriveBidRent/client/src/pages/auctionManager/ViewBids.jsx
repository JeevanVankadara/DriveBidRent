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

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await auctionManagerServices.viewBids(id);
        if (res.success) {
          setAuction(res.data.auction);
          setCurrentBid(res.data.currentBid);
          setPastBids(res.data.pastBids);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, [id]);

  const stopAuction = async () => {
    try {
      const res = await auctionManagerServices.stopAuction(id);
      if (res.success) {
        setMessage('Auction has been stopped.');
        setAuction({ ...auction, auction_stopped: true });
      }
    } catch (err) {
      setMessage('Failed to stop auction');
    }
  };

  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;
  const formatDate = (date) => new Date(date).toLocaleString();

  if (loading) return <div className="text-center py-10 text-xl">Loading...</div>;

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