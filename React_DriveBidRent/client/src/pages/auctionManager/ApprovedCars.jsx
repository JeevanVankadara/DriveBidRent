// client/src/pages/auctionManager/ApprovedCars.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';

export default function ApprovedCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await auctionManagerServices.getApproved();
        if (res.success) setCars(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const startAuction = async (id) => {
    try {
      const res = await auctionManagerServices.startAuction(id);
      if (res.success) {
        setCars(cars.map(car => car._id === id ? { ...car, started_auction: 'yes' } : car));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-10 text-xl">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 font-montserrat">
      {cars.length > 0 ? (
        cars.map((car) => (
          <div
            key={car._id}
            className="flex bg-white rounded-xl mb-6 p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition transform hover:-translate-y-1"
          >
            <div className="w-80 h-48 overflow-hidden rounded-lg mr-8">
              <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-800">{car.vehicleName}</h3>
              <p className="text-lg font-bold text-orange-600 mt-1">
                Condition: {car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
              </p>
              <p className="text-gray-600 mt-2">
                Seller: {car.sellerId.firstName} {car.sellerId.lastName}
              </p>
              <p className="text-gray-600">Location: {car.sellerId.city}</p>
            </div>
            <div className="flex items-end">
              {car.started_auction === 'no' ? (
                <button
                  onClick={() => startAuction(car._id)}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition"
                >
                  Start Auction
                </button>
              ) : (
                <Link
                  to={`/auction-manager/view-bids/${car._id}`}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition text-center"
                >
                  View Bids
                </Link>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-16 text-gray-600 text-lg">
          No approved cars available
        </div>
      )}
    </div>
  );
}