// client/src/pages/buyer/components/VehicleCard.jsx
// Hub-styled vehicle card. Used by the buyer dashboard, the auctions
// and rentals list pages, and the wishlist. Replaced the old CarCard.
import { Link } from 'react-router-dom';
import { Heart, Info, Users } from 'lucide-react';
import { getVehicleCoverImage } from '../../../utils/vehicleImage.util';

const formatINR = (value) => '₹' + (Number(value) || 0).toLocaleString('en-IN');

function Spec({ label, value, highlight }) {
  return (
    <div className="hub-spec">
      <p className="hub-spec-label">{label}</p>
      <p className={`hub-spec-value ${highlight ? 'is-highlight' : ''}`}>{value}</p>
    </div>
  );
}

export default function VehicleCard({ item, type = 'auction', isInWishlist, onToggleWishlist, returnPath }) {
  const isAuction = type === 'auction';
  const detailsLink = isAuction ? `/buyer/auctions/${item._id}` : `/buyer/rentals/${item._id}`;

  const rentActionState = !isAuction
    ? {
        ...(returnPath ? { from: returnPath } : {}),
        openRentModal: true,
      }
    : undefined;

  const currentBid = isAuction ? Number(item.currentHighestBid ?? item.startingBid) || 0 : 0;
  const noAccidents = item.vehicleDocumentation?.accidentHistory === 'no';

  return (
    <article className="hub-surface-card hub-card">
      <div className="hub-card-media">
        <img
          src={getVehicleCoverImage(item)}
          alt={item.vehicleName}
          loading="lazy"
          className="hub-card-img"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
          }}
        />
        <span className={`hub-card-badge ${isAuction ? 'hub-bg-primary' : 'hub-bg-midnight-85'}`}>
          {isAuction ? 'Live Auction' : 'Available Now'}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist();
          }}
          aria-label="Save to wishlist"
          className="hub-card-heart"
        >
          <Heart className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="px-4 pb-5 flex flex-col flex-grow" style={{ gap: '0.75rem' }}>
        <div>
          <h3 className="hub-text-foreground truncate text-base font-semibold">
            {item.vehicleName} {item.year ? `(${item.year})` : ''}
          </h3>
          {isAuction ? (
            <p className="hub-text-muted mt-1 text-xs">
              Ends {item.auctionDate ? new Date(item.auctionDate).toLocaleDateString() : '—'}
            </p>
          ) : (
            <p className="hub-text-rent mt-1 flex items-center gap-1 text-xs">
              <Info className="w-3.5 h-3.5" /> Standard Rental
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {isAuction ? (
            <>
              <Spec label="Fuel type" value={item.fuelType || 'Petrol'} />
              <Spec label="Accident history" value={noAccidents ? 'No Accidents' : 'Has History'} highlight />
            </>
          ) : (
            <>
              <Spec label="Year" value={item.year} />
              <Spec
                label="Capacity"
                value={
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {item.capacity} Seats
                  </span>
                }
              />
            </>
          )}
        </div>

        <div className="hub-border-t pt-3 mt-auto">
          <p className="hub-spec-label">{isAuction ? 'Current highest bid' : 'Starting at'}</p>
          <p className="hub-display text-2xl">
            {formatINR(isAuction ? currentBid : item.costPerDay)}
            {isAuction ? null : <span className="text-sm font-normal">/day</span>}
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <Link to={detailsLink} className="hub-btn-ghost flex-1 text-center">
            Details
          </Link>
          <Link
            to={detailsLink}
            state={rentActionState}
            className={`hub-btn-solid flex-1 text-center ${isAuction ? 'hub-bg-midnight' : 'hub-bg-rent'}`}
          >
            {isAuction ? 'Place Bid' : 'Rent Now'}
          </Link>
        </div>
      </div>
    </article>
  );
}
