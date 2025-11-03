// client/src/pages/auctionManager/ViewBids.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';

export default function ViewBids() {
  const { id } = useParams();
  const [bids, setBids] = useState([]);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        const res = await auctionManagerServices.getBids(id);
        const responseData = res.data || res;
        
        if (responseData.success) {
          setBids(responseData.data.bids || []);
          setCar(responseData.data.car);
        } else {
          setError(responseData.message || 'Failed to load bids');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bids');
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, [id]);

  const endAuction = async () => {
    if (!window.confirm('Are you sure you want to end this auction?')) return;
    
    try {
      setEnding(true);
      const res = await auctionManagerServices.endAuction(id);
      const responseData = res.data || res;
      
      if (responseData.success) {
        alert('Auction ended successfully!');
        window.location.reload();
      } else {
        alert(responseData.message || 'Failed to end auction');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to end auction');
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">View Bids</h2>
        <div className="text-center py-10 text-xl text-gray-600">Loading bids...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">View Bids</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">View Bids</h2>
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg text-center">
          Car not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 font-montserrat">
      <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">View Bids</h2>
      
      <div className="bg-white rounded-xl p-6 shadow-lg mb-8 border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="w-64 h-48 overflow-hidden rounded-lg mr-6">
            <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{car.vehicleName}</h3>
            <p className="text-lg text-orange-600 font-bold mt-1">
              Condition: {car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
            </p>
            <p className="text-gray-600 mt-2">Starting Bid: ₹{car.startingBid}</p>
          </div>
        </div>
        
        <button
          onClick={endAuction}
          disabled={ending}
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ending ? 'Ending Auction...' : 'End Auction'}
        </button>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-4">Bids ({bids.length})</h3>
      
      {bids.length > 0 ? (
        <div className="space-y-4">
          {bids.map((bid, index) => (
            <div
              key={bid._id}
              className="bg-white rounded-lg p-4 shadow border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">
                    {index + 1}. {bid.bidderId.firstName} {bid.bidderId.lastName}
                  </p>
                  <p className="text-gray-600">Contact: {bid.bidderId.phone || 'Not provided'}</p>
                  <p className="text-gray-600">Location: {bid.bidderId.city || 'Not specified'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">₹{bid.bidAmount}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(bid.bidTime).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-600 text-lg">
          No bids placed yet
        </div>
      )}
    </div>
  );
}