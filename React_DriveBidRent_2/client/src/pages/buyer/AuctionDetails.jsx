import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import './AuctionDetails.css';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { createOrGetChatForAuction, getAuctionById, placeBid } from '../../services/buyer.services';
import LoadingSpinner from '../components/LoadingSpinner';

const formatINR = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Rs. 0';
  return `Rs. ${amount.toLocaleString('en-IN')}`;
};

const formatDate = (value) => {
  if (!value) return 'TBD';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const titleCase = (value) => {
  if (!value) return 'N/A';
  return String(value)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const valueOrNA = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return value;
};

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="ad-section-head">
      {eyebrow && <span className="ad-section-head__eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function InfoTile({ label, value, tone = 'default' }) {
  return (
    <div className={`ad-info-tile ad-info-tile--${tone}`}>
      <span>{label}</span>
      <strong>{valueOrNA(value)}</strong>
    </div>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="ad-empty">
      <div className="ad-empty__icon">i</div>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

export default function AuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCurrentBidder, setIsCurrentBidder] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchAuctionDetails = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await getAuctionById(id);
      if (!data?.auction) throw new Error('Auction not found');
      setAuction(data.auction);
      setCurrentBid(data.currentBid || null);
      setIsCurrentBidder(Boolean(data.isCurrentBidder));
    } catch (err) {
      console.error('Error fetching auction details:', err);
      setError('Failed to load auction details');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAuctionDetails(true);

    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'https://drivebidrent.onrender.com';
    const socket = io(backendUrl, { withCredentials: true });

    socket.on('connect', () => {
      socket.emit('join_auction', id);
    });

    socket.on('new_bid', () => {
      fetchAuctionDetails(false);
    });

    return () => {
      socket.emit('leave_auction', id);
      socket.disconnect();
    };
  }, [fetchAuctionDetails, id]);

  const images = useMemo(() => {
    if (!auction) return [];
    const imageSet = new Set();
    if (auction.mainImage) imageSet.add(auction.mainImage);
    if (auction.vehicleImage) imageSet.add(auction.vehicleImage);
    (auction.additionalImages || []).forEach((img) => img && imageSet.add(img));
    (auction.vehicleImages || []).forEach((img) => img && imageSet.add(img));
    return Array.from(imageSet);
  }, [auction]);

  const documents = useMemo(() => {
    const docs = auction?.vehicleDocumentation;
    if (!docs) return [];
    return [
      ['Registration Certificate (RC)', docs.registrationCertificate],
      ['Insurance Document', docs.insuranceDocument],
      ['Fitness Certificate', docs.fitnessCertificate],
      ['RC Transfer Form 29', docs.rcTransferForm29],
      ['Road Tax Receipt', docs.roadTaxReceipt],
      ['Address Proof', docs.addressProof]
    ]
      .filter(([, url]) => Boolean(url))
      .map(([label, url]) => ({ label, url }));
  }, [auction]);

  const minBid = currentBid?.bidAmount ? currentBid.bidAmount + 2000 : (auction?.startingBid || 0);
  const visibleBid = currentBid?.bidAmount || auction?.startingBid || 0;
  const review = auction?.mechanicReview || {};
  const inspection = auction?.multipointInspection || {};
  const hasMechanicReview = Boolean(
    review.mechanicalCondition ||
    review.bodyCondition ||
    review.recommendations ||
    review.conditionRating ||
    inspection.overallRating ||
    inspection.mechanicSummary
  );

  const handlePrevImage = () => {
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleBidAmountChange = (value) => {
    setBidAmount(value);
    setError('');
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();

    if (isCurrentBidder) {
      setError('You already have the current highest bid for this auction.');
      return;
    }

    if (auction?.auction_stopped) {
      setError('This auction has been stopped.');
      return;
    }

    const bidValue = Number(bidAmount);
    if (!Number.isFinite(bidValue) || bidValue <= 0) {
      setError('Please enter a valid bid amount.');
      return;
    }

    if (bidValue < minBid) {
      setError(`Your bid must be at least ${formatINR(minBid)}.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      const result = await placeBid({ auctionId: id, bidAmount: bidValue });

      if (!result.success) {
        setError(result.message || 'Failed to place bid. Please try again.');
        return;
      }

      setSuccess('Your bid has been placed successfully.');
      setBidAmount('');
      setCurrentBid({ bidAmount: bidValue });
      setIsCurrentBidder(true);
      fetchAuctionDetails(false);
    } catch (err) {
      console.error('Error placing bid:', err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactSeller = async () => {
    try {
      setChatLoading(true);
      setError('');
      const chat = await createOrGetChatForAuction(id);
      if (chat) {
        navigate(`/buyer/chats/${chat._id}`);
      } else {
        setError('Unable to create chat. You may need to be logged in.');
      }
    } catch (err) {
      console.error('Error creating chat:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create chat.');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!auction) {
    return (
      <div className="ad-not-found">
        <h2>Auction not found</h2>
        <p>This auction may have ended or been removed.</p>
      </div>
    );
  }

  return (
    <div className="ad-page">
      <ErrorBoundary>
        <div className="ad-shell">
          <button type="button" className="ad-back" onClick={() => navigate('/buyer/auctions')}>
            Back to auctions
          </button>

          <div className="ad-layout">
            <main className="ad-main">
              <section className="ad-gallery-card">
                <div className="ad-gallery__hero">
                  {images.length ? (
                    <img
                      src={images[currentImageIndex]}
                      alt={auction.vehicleName}
                      className="ad-gallery__hero-img active"
                    />
                  ) : (
                    <div className="ad-gallery__placeholder">No vehicle image available</div>
                  )}

                  <div className="ad-gallery__overlay">
                    <div className="ad-gallery__badge">
                      <span className="ad-gallery__live-dot" />
                      Live auction
                    </div>
                    <h1 className="ad-gallery__title">{auction.vehicleName}</h1>
                    <p className="ad-gallery__type">
                      {titleCase(auction.carType)} | {auction.year} | {titleCase(auction.fuelType)}
                    </p>
                  </div>

                  {images.length > 1 && (
                    <>
                      <button type="button" className="ad-gallery__arrow ad-gallery__arrow--left" onClick={handlePrevImage} aria-label="Previous image">
                        <span>&lt;</span>
                      </button>
                      <button type="button" className="ad-gallery__arrow ad-gallery__arrow--right" onClick={handleNextImage} aria-label="Next image">
                        <span>&gt;</span>
                      </button>
                      <div className="ad-gallery__counter">{currentImageIndex + 1} / {images.length}</div>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="ad-gallery__thumbs">
                    {images.map((img, index) => (
                      <button
                        type="button"
                        key={img}
                        className={`ad-gallery__thumb ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img src={img} alt={`${auction.vehicleName} thumbnail ${index + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="ad-stats">
                <InfoTile label="Current bid" value={formatINR(visibleBid)} tone="orange" />
                <InfoTile label="Starting bid" value={formatINR(auction.startingBid)} />
                <InfoTile label="Condition" value={titleCase(auction.condition)} tone="green" />
                <InfoTile label="Auction date" value={formatDate(auction.auctionDate)} />
              </section>

              <section className="ad-card">
                <SectionHeader
                  eyebrow="Overview"
                  title="Vehicle Specifications"
                  description="Key details shared by the seller and verified during the auction workflow."
                />
                <div className="ad-specs">
                  <InfoTile label="Year" value={auction.year} />
                  <InfoTile label="Car type" value={titleCase(auction.carType)} />
                  <InfoTile label="Fuel type" value={titleCase(auction.fuelType)} />
                  <InfoTile label="Transmission" value={titleCase(auction.transmission)} />
                  <InfoTile label="Mileage" value={`${(auction.mileage || 0).toLocaleString('en-IN')} km`} />
                  <InfoTile
                    label="Seller"
                    value={`${auction.seller?.firstName || auction.sellerId?.firstName || ''} ${auction.seller?.lastName || auction.sellerId?.lastName || ''}`.trim() || 'N/A'}
                  />
                </div>
              </section>

              <section className="ad-card ad-card--mechanic">
                <SectionHeader
                  eyebrow="Inspection"
                  title="Mechanic Inspection Review"
                  description="Review notes from the mechanic assigned to inspect this vehicle."
                />

                {hasMechanicReview ? (
                  <>
                    <div className="ad-review-summary">
                      <InfoTile label="Mechanical condition" value={titleCase(review.mechanicalCondition)} tone="blue" />
                      <InfoTile label="Body condition" value={titleCase(review.bodyCondition)} tone="blue" />
                      <InfoTile label="Condition rating" value={titleCase(review.conditionRating)} tone="orange" />
                      <InfoTile label="Overall rating" value={inspection.overallRating ? `${inspection.overallRating}/10` : 'N/A'} tone="green" />
                    </div>

                    {(review.recommendations || inspection.mechanicSummary) && (
                      <div className="ad-mechanic-note">
                        <span>Mechanic notes</span>
                        <p>{review.recommendations || inspection.mechanicSummary}</p>
                      </div>
                    )}

                    <div className="ad-inspection-grid">
                      <InspectionGroup title="Exterior" data={inspection.exterior} fields={['tiresCondition', 'paintCondition', 'scratches', 'dents', 'rust', 'notes']} />
                      <InspectionGroup title="Interior" data={inspection.interior} fields={['seatsCondition', 'dashboardCondition', 'acWorks', 'electronicsWork', 'notes']} />
                      <InspectionGroup title="Engine" data={inspection.engine} fields={['startupSmoothness', 'batteryHealth', 'fluidLeaks', 'abnormalNoise', 'notes']} />
                      <InspectionGroup title="Test Drive" data={inspection.testDrive} fields={['brakesCondition', 'steeringFeel', 'suspension', 'transmissionShift', 'notes']} />
                    </div>
                  </>
                ) : (
                  <EmptyState
                    title="Mechanic review is not available yet"
                    text="The vehicle can still be inspected by the assigned mechanic before final auction approval."
                  />
                )}
              </section>

              {auction.vehicleDocumentation && (
                <section className="ad-card ad-card--verification">
                  <SectionHeader
                    eyebrow="Verification"
                    title="Vehicle Verification Report"
                    description="Document and ownership checks submitted with this auction."
                  />
                  <VerificationReport docs={auction.vehicleDocumentation} assignedMechanic={auction.assignedMechanic} />
                </section>
              )}

              <section className="ad-card">
                <SectionHeader
                  eyebrow="Documents"
                  title="Vehicle Documents"
                  description="Open seller-uploaded documents in a new tab."
                />
                {documents.length ? (
                  <div className="ad-documents">
                    {documents.map((doc) => (
                      <a key={doc.label} href={doc.url} target="_blank" rel="noopener noreferrer" className="ad-doc-link">
                        <span className="ad-doc-link__icon">DOC</span>
                        <span>{doc.label}</span>
                        <strong>Open</strong>
                      </a>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No documents available" text="No seller documents are attached to this auction yet." />
                )}
              </section>
            </main>

            <aside className="ad-side">
              <section className="ad-bid-card">
                <div className="ad-bid-card__head">
                  <span>Live bidding</span>
                  <h2>Place Your Bid</h2>
                </div>

                {error && <div className="ad-bid-card__alert ad-bid-card__alert--error">{error}</div>}
                {success && <div className="ad-bid-card__alert ad-bid-card__alert--success">{success}</div>}

                <div className="ad-bid-card__current">
                  <span>Current highest bid</span>
                  <strong>{currentBid?.bidAmount ? formatINR(currentBid.bidAmount) : 'No bids yet'}</strong>
                </div>

                <button type="button" onClick={() => navigate(`/buyer/live-auction/${id}`)} className="ad-live-room">
                  Enter Live Auction Room
                </button>

                {isCurrentBidder ? (
                  <div className="ad-bid-status ad-bid-status--success">You have the current highest bid.</div>
                ) : auction.auction_stopped ? (
                  <div className="ad-bid-status ad-bid-status--danger">This auction has been stopped.</div>
                ) : (
                  <form onSubmit={handleBidSubmit} className="ad-bid-card__form">
                    <label htmlFor="bidAmount">Your bid amount</label>
                    <input
                      id="bidAmount"
                      type="number"
                      value={bidAmount}
                      onChange={(e) => handleBidAmountChange(e.target.value)}
                      required
                      min="0"
                      step="1000"
                      placeholder={`Minimum ${formatINR(minBid)}`}
                    />
                    <button type="submit" disabled={submitting}>
                      {submitting ? 'Placing bid...' : 'Place Bid Now'}
                    </button>
                  </form>
                )}

                <div className="ad-bid-card__contact">
                  <button type="button" onClick={handleContactSeller} disabled={chatLoading}>
                    {chatLoading ? 'Opening chat...' : 'Book Appointment / Contact Seller'}
                  </button>
                  <p>Schedule a viewing or chat with the seller.</p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}

function InspectionGroup({ title, data, fields }) {
  const entries = fields
    .map((field) => [field, data?.[field]])
    .filter(([, value]) => value !== undefined && value !== null && value !== '');

  if (!entries.length) return null;

  return (
    <div className="ad-inspection-group">
      <h3>{title}</h3>
      <dl>
        {entries.map(([field, value]) => (
          <div key={field}>
            <dt>{titleCase(field.replace(/([A-Z])/g, ' $1'))}</dt>
            <dd>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function VerificationReport({ docs, assignedMechanic }) {
  return (
    <>
      <div className="ad-highlights">
        <InfoTile label="Ownership" value={docs.ownershipType} tone="blue" />
        <InfoTile label="Insurance" value={docs.insuranceStatus} tone={docs.insuranceStatus === 'Valid' ? 'green' : 'red'} />
        <InfoTile label="Accidents" value={docs.accidentHistory ? `${docs.numberOfAccidents || 1} reported` : 'No accidents'} tone={docs.accidentHistory ? 'red' : 'green'} />
        <InfoTile label="Loan status" value={docs.hypothecationStatus} tone={docs.hypothecationStatus?.includes('Clear') ? 'green' : 'orange'} />
        <InfoTile label="PUC" value={docs.pollutionCertificate} tone={docs.pollutionCertificate === 'Valid' ? 'green' : 'red'} />
        <InfoTile label="Transfer ready" value={docs.readyForTransfer ? 'Yes' : 'No'} tone={docs.readyForTransfer ? 'green' : 'red'} />
      </div>

      <div className="ad-notices">
        {docs.previousInsuranceClaims && <div className="ad-notice ad-notice--warning">Previous insurance claims reported.</div>}
        {docs.majorRepairs && <div className="ad-notice ad-notice--warning">Major repairs reported by the seller.</div>}
        {!docs.readyForTransfer && <div className="ad-notice ad-notice--danger">Ownership transfer documents are not fully ready.</div>}
        {docs.stolenVehicleCheck === 'Verified Clean' && <div className="ad-notice ad-notice--success">Vehicle verified as not reported stolen.</div>}
      </div>

      {assignedMechanic && (
        <div className="ad-verified-by">
          <span>Verified by mechanic</span>
          <strong>{assignedMechanic.firstName} {assignedMechanic.lastName}</strong>
        </div>
      )}

      <div className="ad-registration">
        <div>
          <span>Registration No</span>
          <strong>{docs.registrationNumber}</strong>
        </div>
        <div>
          <span>State</span>
          <strong>{docs.registrationState}</strong>
        </div>
        <div>
          <span>VIN</span>
          <strong>{docs.vinNumber}</strong>
        </div>
        <div>
          <span>Service Records</span>
          <strong>{docs.serviceHistory}</strong>
        </div>
      </div>
    </>
  );
}
