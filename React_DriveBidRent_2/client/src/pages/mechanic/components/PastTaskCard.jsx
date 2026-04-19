// client/src/pages/mechanic/components/PastTaskCard.jsx
export default function PastTaskCard({ vehicle }) {
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
          <span className="px-3 py-1 bg-green-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            COMPLETED
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-extrabold text-gray-900 mb-4 truncate group-hover:text-green-600 transition-colors">
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
          <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
            <p className="text-[10px] text-green-800 uppercase tracking-wider font-bold mb-1">Rating Given</p>
            <p className="text-2xl font-black text-green-600 flex items-center justify-center gap-2">
              {vehicle.multipointInspection?.overallRating ? `${vehicle.multipointInspection.overallRating}/10` : vehicle.mechanicReview?.conditionRating || 'N/A'}
              {(vehicle.multipointInspection?.overallRating || vehicle.mechanicReview?.conditionRating) && <span className="text-yellow-500 text-2xl leading-none">★</span>}
            </p>
          </div>
        </div>

        <div className="mt-auto border-t border-gray-100 pt-4">
          <span className="w-full inline-flex justify-center items-center py-3 bg-gray-100 text-gray-500 font-bold rounded-xl">
            Review Submitted
          </span>
        </div>
      </div>
    </div>
  );
}