import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Gavel, 
  Users, 
  Wind, 
  Heart, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Info,
  Clock
} from 'lucide-react';

export default function CarCard({ item, type, isInWishlist, onToggleWishlist, returnPath }) {
  const isAuction = type === "auction";
  const detailsLink = isAuction ? `/buyer/auctions/${item._id}` : `/buyer/rentals/${item._id}`;
  
  const rentActionState = !isAuction ? {
    ...(returnPath ? { from: returnPath } : {}),
    openRentModal: true
  } : undefined;

  const currentBid = isAuction ? (Number(item.currentHighestBid ?? item.startingBid) || 0) : 0;

  return (
    <div className="group relative bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full">
      
      {/* Dynamic Status Badge */}
      <div className="absolute top-5 left-5 z-10">
        {isAuction ? (
          <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-orange-200">
            Live Auction
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-gray-900 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-gray-100 shadow-sm">
            <Clock size={12} className="text-orange-500" />
            Available Now
          </div>
        )}
      </div>

      {/* Premium Wishlist Toggle */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onToggleWishlist();
        }}
        className={`absolute top-5 right-5 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md ${
          isInWishlist 
            ? "bg-orange-500 text-white shadow-lg shadow-orange-200" 
            : "bg-white/80 text-gray-400 hover:text-orange-500 hover:bg-white shadow-sm"
        }`}
      >
        <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
      </button>

      {/* Image Container */}
      <div className="relative h-60 overflow-hidden bg-gray-50">
        <img
          src={item.vehicleImage}
          alt={item.vehicleName}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

        {/* Content Section */}
        <div className="p-7 flex flex-col flex-grow">
          <div className="mb-4">
            <div className="flex justify-between items-start gap-2">
              <h3 className="text-2xl font-black text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                {item.vehicleName} {item.year && `(${item.year})`}
              </h3>
            </div>
            {isAuction ? (
              <p className="text-gray-500 text-sm font-medium mt-1">
                Ends {new Date(item.auctionDate).toLocaleDateString()}
              </p>
            ) : (
              <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm font-medium">
                <Info size={14} className="text-orange-400" />
                <span>Standard Rental</span>
              </div>
            )}
          </div>

          {/* Specs Grid */}
          {isAuction ? (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Fuel Type</p>
                <p className="text-sm font-extrabold text-gray-800 capitalize">{item.fuelType || 'Petrol'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Accident History</p>
                <p className={`text-sm font-extrabold capitalize ${item.vehicleDocumentation?.accidentHistory === 'no' ? 'text-green-700' : 'text-orange-700'}`}>
                  {item.vehicleDocumentation?.accidentHistory === 'no' ? 'No Accidents' : 'Has History'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Year</p>
                <p className="text-sm font-extrabold text-gray-800">{item.year}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Capacity</p>
                <div className="flex items-center gap-1.5 text-sm font-extrabold text-gray-800">
                  <Users size={14} />
                  <span>{item.capacity} Seats</span>
                </div>
              </div>
            </div>
          )}


        {/* Pricing & Actions */}
        <div className="mt-auto pt-6 border-t border-gray-50">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                {isAuction ? "Current Highest Bid" : "Starting At"}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900 tracking-tight">
                  ₹{isAuction ? currentBid.toLocaleString() : Number(item.costPerDay).toLocaleString()}
                </span>
                {!isAuction && <span className="text-gray-400 text-sm font-bold">/day</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to={detailsLink}
              className="flex-1 flex items-center justify-center text-gray-600 font-bold text-sm py-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Details
            </Link>
            <Link
              to={detailsLink}
              state={isAuction ? undefined : rentActionState}
              className={`flex-[1.5] flex items-center justify-center gap-2 text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-lg shadow-orange-100 ${
                isAuction ? "bg-gray-900 hover:bg-orange-600" : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {isAuction ? "Place Bid" : "Rent Now"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}