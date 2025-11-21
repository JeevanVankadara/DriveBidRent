// client/src/pages/mechanic/components/CurrentTaskCard.jsx
import { Link } from 'react-router-dom';

export default function CurrentTaskCard({ vehicle }) {
  return (
    <Link
      to={`/mechanic/car-details/${vehicle._id}`}
      className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-4 border-2 border-orange-300 overflow-hidden h-full flex flex-col"
    >
      <div className="relative">
        <img
          src={vehicle.vehicleImage}
          alt={vehicle.vehicleName}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 left-4 bg-orange-600 text-white font-bold px-6 py-2 rounded-full text-sm shadow">
          ASSIGNED
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{vehicle.vehicleName}</h3>
        <div className="text-gray-600 space-y-1 text-sm">
          <p><strong>Year:</strong> {vehicle.year}</p>
          <p><strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} km</p>
          <p><strong>Condition:</strong> {vehicle.condition}</p>
          <p><strong>Auction:</strong> {new Date(vehicle.auctionDate).toLocaleDateString()}</p>
        </div>
        <div className="mt-auto pt-5">
          <span className="block text-center bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition">
            Inspect Vehicle
          </span>
        </div>
      </div>
    </Link>
  );
}