import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Gavel, 
  Clock, 
  Users, 
  Zap,
  ArrowUpRight
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import CarCard from './components/CarCard';
import useWishlist from '../../hooks/useWishlist';
import './BuyerDashboard.css';

/**
 * Empty State Component for a clean, professional look when no items exist.
 */
const EmptyState = ({ message, icon: Icon, type }) => (
  <div className="flex flex-col items-center justify-center py-14 px-6 rounded-3xl bg-gray-50/50 border border-gray-100 animate-fadeIn">
    <div className={`w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-6 ${type === 'auction' ? 'text-orange-300' : 'text-indigo-300'}`}>
      <Icon size={32} strokeWidth={1.5} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Collection Empty</h3>
    <p className="text-gray-500 text-center font-normal max-w-sm leading-relaxed">{message}</p>
  </div>
);

/**
 * Animated wrapper for each card with exit animation support.
 */
const AnimatedCard = ({ children, isRemoving }) => (
  <div 
    className={`transition-all duration-500 ease-in-out ${
      isRemoving 
        ? 'opacity-0 scale-90 -translate-y-4' 
        : 'opacity-100 scale-100 translate-y-0'
    }`}
  >
    {children}
  </div>
);

export default function Wishlist() {
  const { auctions, rentals, loading, removeFromWishlist, loadWishlist } = useWishlist();
  const [removingIds, setRemovingIds] = useState(new Set());

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const removeFromWishlistHandler = useCallback((id, type) => {
    setRemovingIds(prev => new Set(prev).add(id));
    
    setTimeout(() => {
      removeFromWishlist(id, type);
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 450);
  }, [removeFromWishlist]);

  function isAuctionEnded(auction) {
    if (!auction) return false;
    if (auction.started_auction === 'ended') return true;
    if (auction.auction_stopped === true) return true;
    const endDate = auction.endDate || auction.auctionEnd || auction.auction_end;
    if (endDate) {
      const d = new Date(endDate);
      if (!isNaN(d) && d.getTime() < Date.now()) return true;
    }
    return false;
  }

  const visibleAuctionCount = (auctions?.length || 0) - [...removingIds].filter(id => auctions?.some(a => (a._id || a.id) === id)).length;
  const visibleRentalCount = (rentals?.length || 0) - [...removingIds].filter(id => rentals?.some(r => (r._id || r.id) === id)).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-14 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] pointer-events-none" />
        
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
                Your <span className="text-orange-400">Wishlist</span>
              </h1>
              <p className="text-gray-400 max-w-lg text-base font-normal leading-relaxed">
                Track your favorite auctions and rentals. Everything you've saved, all in one place.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <span className="text-3xl font-bold text-white tabular-nums transition-all duration-500">{visibleAuctionCount}</span>
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Auctions</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <span className="text-3xl font-bold text-white tabular-nums transition-all duration-500">{visibleRentalCount}</span>
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Rentals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 py-14">
        
        {/* AUCTIONS SECTION */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shadow-sm">
                <Gavel size={20} />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  Tracked <span className="text-orange-500 italic">Auctions</span>
                </h2>
              </div>
            </div>
            <Link 
              to="/buyer/auctions" 
              className="group hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-orange-500 transition-all bg-white border border-gray-200 hover:border-orange-200 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300"
            >
              Browse Catalog
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {!auctions || auctions.length === 0 ? (
            <EmptyState 
              message="No auctions in your vault. Secure your next acquisition today." 
              icon={Zap} 
              type="auction"
            />
          ) : (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-50/40 via-white to-gray-50/30 shadow-lg shadow-orange-100/20 border border-orange-100/40">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {auctions.map((auction, idx) => {
                  const id = auction?._id || auction?.id || `auction-${idx}`;
                  return (
                    <AnimatedCard key={id} isRemoving={removingIds.has(id)}>
                      <CarCard
                        item={auction}
                        type="auction"
                        isInWishlist={true}
                        onToggleWishlist={() => removeFromWishlistHandler(id, 'auction')}
                      />
                    </AnimatedCard>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* RENTALS SECTION */}
        <section className="pb-10">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  Rental <span className="text-indigo-600 italic">Selection</span>
                </h2>
              </div>
            </div>
            <Link 
              to="/buyer/rentals" 
              className="group hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-all bg-white border border-gray-200 hover:border-indigo-200 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300"
            >
              Discover Fleet
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {!rentals || rentals.length === 0 ? (
            <EmptyState 
              message="The fleet is waiting. Save vehicles to compare and book your journey." 
              icon={Clock} 
              type="rental"
            />
          ) : (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/40 via-white to-gray-50/30 shadow-lg shadow-indigo-100/20 border border-indigo-100/40">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {rentals.map((rental, idx) => {
                  const id = rental?._id || rental?.id || `rental-${idx}`;
                  return (
                    <AnimatedCard key={id} isRemoving={removingIds.has(id)}>
                      <CarCard
                        item={rental}
                        type="rental"
                        returnPath="/buyer/wishlist"
                        isInWishlist={true}
                        onToggleWishlist={() => removeFromWishlistHandler(id, 'rental')}
                      />
                    </AnimatedCard>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}