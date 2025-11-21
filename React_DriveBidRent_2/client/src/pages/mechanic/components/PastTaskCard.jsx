// client/src/pages/mechanic/components/PastTaskCard.jsx
export default function PastTaskCard({ vehicle }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-green-300 overflow-hidden h-full flex flex-col">
      <div className="relative">
        <img
          src={vehicle.vehicleImage}
          alt={vehicle.vehicleName}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 left-4 bg-green-600 text-white font-bold px-6 py-2 rounded-full text-sm shadow">
          COMPLETED
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{vehicle.vehicleName}</h3>
        <div className="text-gray-600 space-y-1 text-sm">
          <p><strong>Year:</strong> {vehicle.year}</p>
          <p><strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} km</p>
          <p><strong>Rating Given:</strong> {vehicle.mechanicReview?.conditionRating || 'N/A'} Stars</p>
        </div>
      </div>
    </div>
  );
}