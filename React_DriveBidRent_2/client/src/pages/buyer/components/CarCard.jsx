// client/src/pages/buyer/components/CarCard.jsx
import { Link } from "react-router-dom";

export default function CarCard({ item, type, isInWishlist, onToggleWishlist, returnPath }) {
  const isAuction = type === "auction";

  const detailsLink = isAuction ? `/buyer/auctions/${item._id}` : `/buyer/rentals/${item._id}`;

  const getActionText = () => (isAuction ? "Place Bid" : "Rent Now");

  const detailLinkState = !isAuction && returnPath ? { from: returnPath } : undefined;
  const rentActionState =
    !isAuction
      ? {
        ...(returnPath ? { from: returnPath } : {}),
        openRentModal: true
      }
      : undefined;

  return (
    <div className="group relative bg-gradient-to-br from-white via-orange-50/30 to-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(255,107,0,0.12)] hover:shadow-[0_20px_60px_rgba(255,107,0,0.25)] hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col h-full border border-orange-100/50 hover:border-orange-300/80">
      {/* Premium Tags with Gradient */}
      {isAuction && (
        <span className="absolute top-5 left-5 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white px-5 py-2 rounded-full text-sm font-bold z-10 shadow-[0_4px_12px_rgba(255,107,0,0.4)] backdrop-blur-sm flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
          Hot Auction
        </span>
      )}
      {!isAuction && (
        <span className="absolute top-5 left-5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 text-white px-5 py-2 rounded-full text-sm font-bold z-10 shadow-[0_4px_12px_rgba(59,130,246,0.4)] backdrop-blur-sm flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
          Available
        </span>
      )}

      {/* Premium Wishlist Button */}
      <button
        onClick={onToggleWishlist}
        className={`absolute top-5 right-5 w-11 h-11 rounded-full flex items-center justify-center text-2xl z-10 transition-all duration-300 backdrop-blur-md ${
          isInWishlist 
            ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-[0_4px_12px_rgba(255,107,0,0.4)] scale-110" 
            : "bg-white/90 text-gray-400 hover:text-orange-500 hover:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(255,107,0,0.2)] hover:scale-110"
        }`}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isInWishlist ? "♥" : "♡"}
      </button>

      {/* Premium Image Container with Overlay */}
      <div className="relative overflow-hidden bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <img
          src={item.vehicleImage}
          alt={item.vehicleName}
          className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
          }}
        />
      </div>

      {/* Premium Content Section */}
      <div className="p-7 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent group-hover:from-orange-500 group-hover:to-red-500 transition-all duration-300 leading-tight">{item.vehicleName}</h3>

        {isAuction ? (
          <p className="text-gray-600 mt-2 text-sm font-medium">
            <span className="text-gray-500">Auction on:</span> <strong className="text-gray-800">{new Date(item.auctionDate).toLocaleDateString()}</strong>
          </p>
        ) : (
          <p className="text-gray-600 mt-2 text-sm font-medium">
            <span className="text-gray-500">Daily Rate:</span> <strong className="text-orange-600">₹{item.costPerDay}</strong>
          </p>
        )}

        {/* Premium Details Section */}
        <div className="mt-5 bg-gradient-to-br from-gray-50 to-orange-50/30 p-5 rounded-2xl flex-grow space-y-3 text-sm border border-gray-100/50">
          <p className="flex justify-between items-center"><span className="text-gray-600 font-medium">Year:</span> <span className="font-bold text-gray-800">{item.year}</span></p>

          {isAuction ? (
            <>
              <p className="flex justify-between items-center"><span className="text-gray-600 font-medium">Mileage:</span> <span className="font-bold text-gray-800">{item.mileage?.toLocaleString()} km</span></p>
              <p className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Condition:</span>{" "}
                <span className="font-bold text-gray-800">{item.condition?.charAt(0).toUpperCase() + item.condition?.slice(1)}</span>
              </p>
            </>
          ) : (
            <>
              <p className="flex justify-between items-center"><span className="text-gray-600 font-medium">Capacity:</span> <span className="font-bold text-gray-800">{item.capacity} passengers</span></p>
              <p className="flex justify-between items-center"><span className="text-gray-600 font-medium">AC:</span> <span className="font-bold text-gray-800">{item.AC === "available" ? "Yes" : "No"}</span></p>
            </>
          )}
        </div>

        {/* Premium Vehicle Documentation Status */}
        {isAuction && item.vehicleDocumentation && (
          <div className="mt-5 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 p-4 rounded-2xl border border-blue-200/50 shadow-sm">
            <p className="text-xs font-bold text-blue-800 mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
              Vehicle Verification
            </p>
            <div className="flex flex-wrap gap-2">
              {item.vehicleDocumentation.registrationNumber && (
                <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1.5 rounded-full font-bold shadow-sm border border-green-200/50">
                  ✓ Registered
                </span>
              )}
              {item.vehicleDocumentation.insuranceStatus === 'Valid' && (
                <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1.5 rounded-full font-bold shadow-sm border border-green-200/50">
                  ✓ Insured
                </span>
              )}
              {item.vehicleDocumentation.pollutionCertificate === 'Valid' && (
                <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1.5 rounded-full font-bold shadow-sm border border-green-200/50">
                  ✓ PUC
                </span>
              )}
              {item.vehicleDocumentation.accidentHistory === 'no' && (
                <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1.5 rounded-full font-bold shadow-sm border border-green-200/50">
                  ✓ No Accident
                </span>
              )}
              {item.vehicleDocumentation.accidentHistory !== 'no' && (
                <span className="text-xs bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 px-3 py-1.5 rounded-full font-bold shadow-sm border border-yellow-200/50">
                  ⚠ Accident History
                </span>
              )}
            </div>
          </div>
        )}

        {/* Premium Price Section */}
        <div className="mt-6">
          {isAuction ? (
            <div className="flex flex-col bg-gradient-to-br from-orange-50 to-red-50/50 p-4 rounded-2xl border border-orange-200/50">
              <span className="text-sm text-gray-600 font-medium">Starting at ₹{(Number(item.startingBid) || 0).toLocaleString()}</span>
              <span className="text-xs uppercase text-gray-500 mt-1 font-bold tracking-wider">Current Price</span>
              <span className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent leading-tight tracking-tight mt-2">₹{(Number(item.currentHighestBid ?? item.startingBid) || 0).toLocaleString()}</span>
            </div>
          ) : (
            <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">₹{(Number(item.costPerDay) || 0).toLocaleString()}<span className="text-xl text-gray-600">/day</span></div>
          )}
        </div>

        {/* Premium Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Link
            to={detailsLink}
            state={detailLinkState}
            className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 text-white text-center py-3.5 rounded-xl font-bold hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            View Details
          </Link>
          {!isAuction && (
            <Link
              to={detailsLink}
              state={rentActionState}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-3.5 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-[0_4px_12px_rgba(255,107,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,107,0,0.4)] transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {getActionText()}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}