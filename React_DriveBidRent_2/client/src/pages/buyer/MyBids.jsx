import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBids } from '../../services/buyer.services';
import LoadingSpinner from '../components/LoadingSpinner';
import './BuyerDashboard.css';

export default function MyBids() {
  const [auctionsWithBids, setAuctionsWithBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initial fetch with loading state
    fetchMyBids(true);
    
    // Set up polling for real-time bid updates every 1 second (without loading state)
    const intervalId = setInterval(() => {
      if (!error) {
        fetchMyBids(false);
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchMyBids = async (isInitial = false) => {
    try {
      const data = await getMyBids();
      setAuctionsWithBids(data);
    } catch (error) {
      setError("Failed to load your bids.");
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-600 border border-green-600";
      case "ended":
        return "bg-red-100 text-red-600 border border-red-600";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-500";
      default:
        return "bg-green-100 text-green-600 border border-green-600";
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white">

      {/* ⭐ HERO SECTION ⭐ */}
      <section
        className="relative h-72 md:h-80 lg:h-96 bg-cover bg-center text-white"
        style={{
          backgroundImage: "url('/images/bids-hero.jpg')",
          backgroundColor: "#403a2e",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 px-6 text-center flex items-center justify-center h-full">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              My <span className="text-orange-500">Bids</span>
            </h1>
            <p className="mt-3 text-lg md:text-xl text-gray-100">
              Track all auctions you’ve participated in.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent" />
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-5 py-16">

        {error && (
          <div className="buyer-section animate-fade-in-up" style={{ backgroundColor: '#fee2e2', border: '2px solid #dc2626', marginBottom: '2rem' }}>
            <p className="text-red-600 text-center font-semibold">{error}</p>
          </div>
        )}

        {auctionsWithBids.length > 0 ? (
          <div className="flex flex-col gap-10">
            {auctionsWithBids.map((auctionBid) => (
              <div
                key={auctionBid.auction?._id}
                className="buyer-card animate-fade-in-up flex flex-col md:flex-row overflow-hidden"
              >
                {/* IMAGE */}
                <div className="md:w-80 w-full h-56 md:h-auto overflow-hidden">
                  <img
                    src={auctionBid.auction?.vehicleImage}
                    alt={auctionBid.auction?.vehicleName}
                    className="buyer-card-image w-full h-full"
                    onError={(e) =>
                      (e.target.src =
                        "https://placehold.co/400x300/f3f4f6/6b7280?text=No+Image")
                    }
                  />
                </div>

                {/* CONTENT */}
                <div className="flex-1 p-6 flex flex-col justify-between buyer-card-content">
                  {/* HEADER */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="buyer-card-title">
                        {auctionBid.auction?.vehicleName}
                      </h3>
                      <p className="buyer-card-text">
                        Seller: {auctionBid.seller?.firstName}{" "}
                        {auctionBid.seller?.lastName}
                      </p>
                    </div>

                    <span
                      className={`buyer-badge ${getStatusStyle(
                        auctionBid.bidStatus
                      )}`}
                    >
                      {auctionBid.bidStatus.charAt(0).toUpperCase() +
                        auctionBid.bidStatus.slice(1)}
                    </span>
                  </div>

                  {/* DETAILS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                    <div>
                      <p className="text-gray-500 text-xs uppercase font-semibold">
                        Your Highest Bid
                      </p>
                      <p className="text-xl font-bold">
                        ₹{auctionBid.myHighestBid?.toLocaleString()}
                      </p>
                    </div>

                    {auctionBid.highestBid != null && (
                      <div>
                        <p className="text-gray-500 text-xs uppercase font-semibold">
                          {auctionBid.bidStatus === "ended"
                            ? "Final Highest Bid"
                            : "Current Highest Bid"}
                        </p>
                        <p className="text-xl font-bold">
                          ₹{auctionBid.highestBid.toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-gray-500 text-xs uppercase font-semibold">
                        Total Bids
                      </p>
                      <p className="text-xl font-bold">
                        {auctionBid.totalBids}
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-4">
                    {auctionBid.bidStatus !== "ended" && (
                      <Link
                        to={`/buyer/auctions/${auctionBid.auction?._id}`}
                        className="buyer-btn-secondary px-6 py-3 rounded-lg font-semibold"
                      >
                        View Auction
                      </Link>
                    )}

                    {auctionBid.bidStatus === "active" && (
                      <Link
                        to={`/buyer/auctions/${auctionBid.auction?._id}`}
                        className="buyer-btn-primary px-6 py-3 rounded-lg font-semibold"
                      >
                        Place New Bid
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // NO BIDS STATE
          <div className="buyer-empty-state">
            <div className="buyer-empty-icon">🚗</div>
            <p className="buyer-empty-text mb-4">No Bids Yet</p>
            <p className="text-gray-600 mb-6">
              You haven't participated in any auctions yet.
            </p>
            <Link
              to="/buyer/auctions"
              className="buyer-btn-primary px-8 py-4 rounded-lg font-semibold inline-block"
            >
              Explore Available Auctions →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
