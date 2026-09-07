import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import io from 'socket.io-client';
import {
  getDashboardData,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../services/buyer.services";
import VehicleCard from "./components/VehicleCard";
import HeroSlider from "./components/HeroSlider";
import LoadingSpinner from "../components/LoadingSpinner";
import { ChevronRight, Gavel, ShieldCheck, KeyRound, LayoutGrid } from "lucide-react";

const features = [
  { icon: Gavel, title: "Transparent bidding", body: "Live highest bids, no hidden reserve games." },
  { icon: ShieldCheck, title: "Verified history", body: "Accident and service records on every listing." },
  { icon: KeyRound, title: "Instant rentals", body: "Reserve a car in under two minutes." },
];

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

    // Setup Socket.io for real-time bid updates
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'https://drivebidrent.onrender.com';
    const socket = io(backendUrl, { withCredentials: true });

    socket.on('global_new_bid', () => {
      loadData(false);
    });

    return () => socket.disconnect();
  }, []);

  const handleWishlistToggle = async (id, type) => {
    const key = type === "auction" ? "auctions" : "rentals";
    const isLiked = wishlist[key].includes(id);
    try {
      if (isLiked) {
        await removeFromWishlist(id, type);
        setWishlist((prev) => ({
          ...prev,
          [key]: prev[key].filter((x) => x !== id)
        }));
      } else {
        await addToWishlist(id, type);
        setWishlist((prev) => ({
          ...prev,
          [key]: [...prev[key], id]
        }));
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <HeroSlider />

      <section className="mx-auto grid max-w-[1400px] gap-4 px-5 py-10 md:grid-cols-3 lg:px-10">
        {features.map((f) => (
          <div key={f.title} className="hub-surface-card flex gap-4 p-6">
            <span className="hub-bg-primary-soft grid w-11 h-11 shrink-0 place-items-center rounded-xl">
              <f.icon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="hub-text-muted mt-1 text-sm">{f.body}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-8 lg:px-10">
        <span className="hub-eyebrow hub-bg-primary-soft rounded-full px-3 py-1">
          ● Live Opportunities
        </span>
        <div className="mt-4 flex items-end justify-between gap-4">
          <h2 className="hub-display text-4xl">
            Featured <span className="hub-accent-italic">Auctions</span>
          </h2>
          <Link
            to="/buyer/auctions"
            className="hub-eyebrow hub-text-foreground-70 flex items-center gap-1"
          >
            View all listings <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredAuctions.length === 0 ? (
          <EmptyState message="No auctions available right now." />
        ) : (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredAuctions.map((auction) => (
              <VehicleCard
                key={auction._id}
                item={auction}
                type="auction"
                isInWishlist={wishlist.auctions.includes(auction._id)}
                onToggleWishlist={() => handleWishlistToggle(auction._id, "auction")}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1400px] px-5 pb-16 pt-8 lg:px-10">
        <span className="hub-eyebrow hub-bg-rent-soft rounded-full px-3 py-1">
          Available Rentals
        </span>
        <div className="mt-4 flex items-end justify-between gap-4">
          <h2 className="hub-display text-4xl">
            Elite <span className="hub-accent-italic">Rentals</span>
          </h2>
          <Link
            to="/buyer/rentals"
            className="hub-eyebrow hub-text-foreground-70 flex items-center gap-1"
          >
            See all rentals <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredRentals.length === 0 ? (
          <EmptyState message="No rentals available right now." />
        ) : (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredRentals.slice(0, 8).map((rental) => (
              <VehicleCard
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
      </section>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="hub-empty mt-7">
    <div className="hub-bg-card hub-border w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
      <LayoutGrid className="hub-text-muted w-10 h-10" />
    </div>
    <h3 className="hub-display text-2xl mb-2">Inventory Empty</h3>
    <p className="hub-text-muted text-center max-w-xs">{message}</p>
  </div>
);

export default Dashboard;
