// client/src/pages/buyer/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDashboardData,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getUnreadNotificationCount,
} from "../../services/buyer.services";
import CarCard from "./components/CarCard";
import HeroSlider from "./components/HeroSlider";
import LoadingSpinner from "../components/LoadingSpinner";

const Dashboard = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [featuredRentals, setFeaturedRentals] = useState([]);
  const [wishlist, setWishlist] = useState({ auctions: [], rentals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const [dash, wl] = await Promise.all([
          getDashboardData(),
          getWishlist(),
          getUnreadNotificationCount(),
        ]);
        setFeaturedAuctions(dash.featuredAuctions || []);
        setFeaturedRentals(dash.featuredRentals || []);
        const auctionIds = (wl.auctions || []).map((a) => a._id || a);
        const rentalIds = (wl.rentals || []).map((r) => r._id || r);
        setWishlist({ auctions: auctionIds, rentals: rentalIds });
      } catch (err) {
        console.error("Dashboard failed to load:", err);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    loadData(true);
    const intervalId = setInterval(() => loadData(false), 2000);
    return () => clearInterval(intervalId);
  }, []);

  const handleWishlistToggle = async (id, type) => {
    const key = type === "auction" ? "auctions" : "rentals";
    const isLiked = wishlist[key].includes(id);
    try {
      if (isLiked) {
        await removeFromWishlist(id, type);
        setWishlist((prev) => ({ ...prev, [key]: prev[key].filter((x) => x !== id) }));
      } else {
        await addToWishlist(id, type);
        setWishlist((prev) => ({ ...prev, [key]: [...prev[key], id] }));
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <HeroSlider />

      {/* Featured Auctions */}
      <section className="py-14 sm:py-18 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 rounded-full bg-orange-500 inline-block" />
              <span className="text-orange-500 font-bold text-xs tracking-widest uppercase">Live Now</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
              Featured <span className="text-orange-500">Auctions</span>
            </h2>
          </div>
          <Link
            to="/buyer/auctions"
            className="group inline-flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-semibold text-sm border border-orange-200 hover:border-orange-400 px-4 py-2 rounded-full transition-all"
          >
            View all
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {featuredAuctions.length === 0 ? (
          <EmptyState message="No auctions available right now." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredAuctions.map((auction) => (
              <CarCard
                key={auction._id}
                item={auction}
                type="auction"
                isInWishlist={wishlist.auctions.includes(auction._id)}
                onToggleWishlist={() => handleWishlistToggle(auction._id, "auction")}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/buyer/auctions"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full text-base font-bold transition-all shadow-md hover:shadow-lg"
          >
            Browse All Auctions
          </Link>
        </div>
      </section>

      {/* Section divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
      </div>

      {/* Featured Rentals */}
      <section className="py-14 sm:py-18 lg:py-20 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-8 rounded-full bg-orange-500 inline-block" />
                <span className="text-orange-500 font-bold text-xs tracking-widest uppercase">Available Today</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
                Featured <span className="text-orange-500">Rentals</span>
              </h2>
            </div>
            <Link
              to="/buyer/rentals"
              className="group inline-flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-semibold text-sm border border-orange-200 hover:border-orange-400 px-4 py-2 rounded-full transition-all"
            >
              View all
              <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {featuredRentals.length === 0 ? (
            <EmptyState message="No rentals available right now." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredRentals.slice(0, 8).map((rental) => (
                <CarCard
                  key={rental._id}
                  item={rental}
                  type="rental"
                  returnPath="/buyer"
                  isInWishlist={wishlist.rentals.includes(rental._id)}
                  onToggleWishlist={() => handleWishlistToggle(rental._id, "rental")}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/buyer/rentals"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full text-base font-bold transition-all shadow-md hover:shadow-lg"
            >
              Browse All Rentals
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-orange-50 border-2 border-orange-100 flex items-center justify-center mb-4">
      <svg className="w-7 h-7 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p className="text-gray-400 text-lg">{message}</p>
  </div>
);

export default Dashboard;