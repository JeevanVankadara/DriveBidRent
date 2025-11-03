// client/src/pages/auctionManager/Requests.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await auctionManagerServices.getRequests();
        if (res.success) setRequests(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) return <div className="text-center py-10 text-xl">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.length > 0 ? (
          requests.map((req) => (
            <Link
              key={req._id}
              to={`/auction-manager/assign-mechanic/${req._id}`}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer block"
            >
              <img src={req.vehicleImage} alt={req.vehicleName} className="w-full h-48 object-cover rounded-lg mb-4" />
              <h3 className="text-xl font-bold text-gray-800">{req.vehicleName}</h3>
              <p className="text-gray-600">
                Seller: {req.sellerId.firstName} {req.sellerId.lastName}
              </p>
              <p className="text-gray-600">Location: {req.sellerId.city}</p>
              <button className="w-full mt-4 bg-orange-600 text-white py-2 rounded-lg font-bold hover:opacity-90 transition">
                More Details
              </button>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600 text-lg py-10">
            No pending requests
          </p>
        )}
      </div>
    </div>
  );
}