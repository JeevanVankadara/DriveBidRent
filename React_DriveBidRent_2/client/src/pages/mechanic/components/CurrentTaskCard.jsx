// client/src/pages/mechanic/components/CurrentTaskCard.jsx
import { Link } from 'react-router-dom';

export default function CurrentTaskCard({ vehicle }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col h-full group">
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <img
          src={vehicle.vehicleImage}
          alt={vehicle.vehicleName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            ASSIGNED
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-extrabold text-gray-900 mb-4 truncate group-hover:text-blue-600 transition-colors">
          {vehicle.vehicleName}
        </h3>

        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Make Year</p>
              <p className="text-lg font-black text-gray-900">{vehicle.year}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Mileage</p>
              <p className="text-lg font-black text-gray-900">{(vehicle.mileage || 0).toLocaleString()} <span className="text-xs text-gray-500 font-medium">km</span></p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Condition</p>
              <p className="text-sm font-black text-gray-900 capitalize truncate">{vehicle.condition}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Auction Date</p>
              <p className="text-sm font-black text-gray-900 truncate">
                {vehicle.auctionDate ? new Date(vehicle.auctionDate).toLocaleDateString() : 'TBD'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto border-t border-gray-100 pt-4">
          <Link
            to={`/mechanic/car-details/${vehicle._id}`}
            className="w-full inline-flex justify-center items-center py-3 bg-gray-900 hover:bg-blue-600 text-white font-bold rounded-xl transition duration-300"
          >
            Inspect Vehicle
          </Link>
        </div>
      </div>
    </div>
  );
}