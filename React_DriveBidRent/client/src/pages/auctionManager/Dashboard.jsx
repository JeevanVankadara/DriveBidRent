// client/src/pages/auctionManager/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';

export default function Dashboard() {
  const [data, setData] = useState({ pending: [], assigned: [], approved: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await auctionManagerServices.getDashboard();
        const responseData = res.data || res;
        
        if (responseData.success) {
          setData(responseData.data || { pending: [], assigned: [], approved: [] });
        } else {
          setError(responseData.message || 'Failed to load dashboard');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-xl">
        <p>Loading dashboard...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 text-xl mb-4">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-16 font-montserrat">
      <section>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">REQUESTS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.pending.length > 0 ? (
            data.pending.map((req) => (
              <div key={req._id} className="border border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                <img src={req.vehicleImage} alt={req.vehicleName} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">{req.vehicleName}</h3>
                  <p className="text-sm text-gray-600">
                    Seller: {req.sellerId.firstName} {req.sellerId.lastName}
                  </p>
                  <p className="text-sm text-gray-600">Location: {req.sellerId.city}</p>
                  <div className="text-center mt-4">
                    <Link
                      to={`/auction-manager/assign-mechanic/${req._id}`}
                      className="text-orange-600 font-bold hover:opacity-80 transition"
                    >
                      More Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-600">No pending requests found</p>
          )}
        </div>
        <div className="text-center mt-6">
          <Link to="/auction-manager/requests" className="text-orange-600 font-bold hover:opacity-80 transition">
            See More
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">PENDING CARS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.assigned.length > 0 ? (
            data.assigned.map((car) => (
              <div key={car._id} className="border border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">{car.vehicleName}</h3>
                  <p className="text-sm text-gray-600">
                    Seller: {car.sellerId.firstName} {car.sellerId.lastName}
                  </p>
                  <p className="text-sm text-gray-600">Location: {car.sellerId.city}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-600">No cars currently pending inspection</p>
          )}
        </div>
        <div className="text-center mt-6">
          <Link to="/auction-manager/pending" className="text-orange-600 font-bold hover:opacity-80 transition">
            See More
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">APPROVED CARS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.approved.length > 0 ? (
            data.approved.map((car) => (
              <div key={car._id} className="border border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">{car.vehicleName}</h3>
                  <p className="text-sm text-gray-600">Year: {car.year}</p>
                  <p className="text-sm text-gray-600">Mileage: {car.mileage} km</p>
                  <p className="text-sm text-gray-600">Status: Approved</p>
                  <p className="text-sm text-gray-600">Starting Bid: ₹{car.startingBid}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-600">No approved cars available</p>
          )}
        </div>
        <div className="text-center mt-6">
          <Link to="/auction-manager/approved" className="text-orange-600 font-bold hover:opacity-80 transition">
            See More
          </Link>
        </div>
      </section>
    </div>
  );
}