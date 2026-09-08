// client/src/pages/auctionManager/PendingCarDetails.jsx
//
// The auction manager's decision page for one vehicle.
//
// Rebuilt on the shared Hub theme. It now renders ONLY the fields the
// simplified Add Auction form still collects — VIN, chassis and engine
// numbers, hypothecation, stolen-vehicle checks, court cases, fitness
// certificates, Form 29, road tax and address proof were all dropped from the
// form, so showing empty rows for them was just noise.
//
// The mechanic's inspection is the thing the decision hangs on, so it sits at
// the top of the sidebar, and approval is blocked until it exists.
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';
import ApproveAuctionModal from './components/ApproveAuctionModal';

const RATING_WORDS = { 1: 'Poor', 2: 'Below average', 3: 'Average', 4: 'Good', 5: 'Excellent' };

const formatINR = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? `₹${n.toLocaleString('en-IN')}` : 'N/A';
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

const yesNo = (value) => (value ? 'Yes' : 'No');

/* ── building blocks ─────────────────────────────────────────── */

function Panel({ title, subtitle, children, footer }) {
  return (
    <section className="hub-surface-card overflow-hidden">
      <div className="px-5 py-4 border-b hub-border-c">
        <h2 className="hub-display text-lg leading-tight">{title}</h2>
        {subtitle && <p className="text-xs hub-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="px-5 py-3 border-t hub-border-c hub-bg-secondary-50">{footer}</div>}
    </section>
  );
}

function Row({ label, value, tone }) {
  const toneClass =
    tone === 'good' ? 'hub-text-primary' : tone === 'bad' ? 'text-red-600' : 'hub-text-foreground';
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b hub-border-c last:border-b-0">
      <span className="text-sm hub-text-muted">{label}</span>
      <span className={`text-sm font-semibold text-right ${toneClass}`}>{value ?? 'N/A'}</span>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div className="hub-spec">
      <p className="hub-spec-label">{label}</p>
      <p className="hub-spec-value">{value ?? 'N/A'}</p>
    </div>
  );
}

function RatingBar({ label, value }) {
  const n = Number(value) || 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm hub-text-foreground">{label}</span>
        <span className="text-sm font-semibold hub-text-primary whitespace-nowrap">
          {n ? `${n}/5 · ${RATING_WORDS[n]}` : 'Not rated'}
        </span>
      </div>
      <div className="flex gap-1 mt-1.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{ backgroundColor: i <= n ? 'var(--primary)' : 'var(--border)' }}
          />
        ))}
      </div>
    </div>
  );
}

function DocLink({ href, label }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hub-btn-ghost flex items-center justify-between gap-3 mb-2 last:mb-0"
    >
      <span>{label}</span>
      <span className="hub-text-primary text-xs">Open ↗</span>
    </a>
  );
}

/* ── page ────────────────────────────────────────────────────── */

export default function PendingCarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const res = await auctionManagerServices.getPendingCarDetails(id);
        const data = res.data || res;
        if (data.success) {
          setCar(data.data);
          setStatus(data.data.status || 'pending');
        } else {
          setError(data.message || 'Failed to load details');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const handleReject = async () => {
    if (!window.confirm('Reject this vehicle request?')) return;
    setActionError('');
    try {
      setActionLoading(true);
      const res = await auctionManagerServices.updateStatus(id, 'rejected');
      if (res.data?.success || res.success) setStatus('rejected');
      else setActionError(res.data?.message || res.message || 'Failed to reject');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveConfirm = async (startingBid) => {
    setShowApproveModal(false);
    setActionError('');
    try {
      setActionLoading(true);
      const res = await auctionManagerServices.updateStatus(id, 'approved', startingBid);
      if (res.data?.success || res.success) {
        setStatus('approved');
        navigate('/auctionmanager/approved');
      } else {
        setActionError(res.data?.message || res.message || 'Failed to approve');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error || !car) {
    return (
      <div className="min-h-[70vh] grid place-items-center px-4">
        <div className="hub-surface-card p-10 text-center max-w-sm">
          <h2 className="hub-display text-xl mb-1">Could not load vehicle</h2>
          <p className="text-sm hub-text-muted">{error || 'Vehicle not found'}</p>
        </div>
      </div>
    );
  }

  const doc = car.vehicleDocumentation || {};
  const insp = car.multipointInspection || {};
  const hasInspection = Boolean(
    insp.overallRating || insp.interiorRating || insp.engineRating || insp.additionalNotes
  );

  const images = (() => {
    const imgs = [car.mainImage || car.vehicleImage, ...(car.additionalImages || [])].filter(Boolean);
    return imgs.length ? [...new Set(imgs)] : [];
  })();

  // Only the documents the form still uploads.
  const documents = [
    { label: 'Registration Certificate (RC)', url: doc.registrationCertificate },
    { label: 'Insurance Document', url: doc.insuranceDocument },
  ].filter((d) => d.url);

  const statusMeta = {
    approved: { label: 'Approved', cls: 'hub-bg-primary-soft' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
    pending: { label: 'Awaiting decision', cls: 'hub-bg-secondary' },
    assignedMechanic: { label: 'Under inspection', cls: 'hub-bg-rent-soft' },
  };
  const badge = statusMeta[status] || statusMeta.pending;
  const decided = status === 'approved' || status === 'rejected';
  const seller = car.sellerId || {};

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-8">

        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <span className="hub-eyebrow hub-text-primary">Auction request</span>
            <h1 className="hub-display text-3xl mt-1">{car.vehicleName}</h1>
            <p className="hub-text-muted text-sm mt-1">
              {car.year} · {car.carType} · {Number(car.mileage || 0).toLocaleString('en-IN')} km
            </p>
          </div>
          <span className={`hub-card-badge !static ${badge.cls}`}>{badge.label}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── left column ── */}
          <div className="lg:col-span-2 space-y-6">

            <section className="hub-surface-card overflow-hidden">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[activeImageIndex]}
                    alt={car.vehicleName}
                    className="w-full h-[340px] object-cover"
                  />
                  {images.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto">
                      {images.map((img, i) => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => setActiveImageIndex(i)}
                          aria-label={`Photo ${i + 1}`}
                          aria-current={i === activeImageIndex}
                          className="shrink-0 rounded-lg overflow-hidden"
                          style={{
                            border: `2px solid ${i === activeImageIndex ? 'var(--primary)' : 'transparent'}`,
                          }}
                        >
                          <img src={img} alt="" className="h-14 w-20 object-cover" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-[340px] grid place-items-center hub-bg-secondary">
                  <p className="hub-text-muted text-sm">No photos provided</p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border-t hub-border-c">
                <Spec label="Year" value={car.year} />
                <Spec label="Mileage" value={`${Number(car.mileage || 0).toLocaleString('en-IN')} km`} />
                <Spec label="Fuel" value={car.fuelType} />
                <Spec label="Transmission" value={car.transmission} />
              </div>
            </section>

            <Panel title="Registration & ownership">
              <Row label="Registration number" value={doc.registrationNumber} />
              <Row label="Registration state" value={doc.registrationState} />
              <Row label="Ownership" value={doc.ownershipType} />
              <Row
                label="Ready for transfer"
                value={yesNo(doc.readyForTransfer)}
                tone={doc.readyForTransfer ? 'good' : 'bad'}
              />
            </Panel>

            <Panel title="Insurance">
              <Row
                label="Status"
                value={doc.insuranceStatus}
                tone={doc.insuranceStatus === 'Valid' ? 'good' : 'bad'}
              />
              {doc.insuranceType && <Row label="Type" value={doc.insuranceType} />}
              {doc.insuranceExpiryDate && <Row label="Expires" value={formatDate(doc.insuranceExpiryDate)} />}
              <Row
                label="Previous claims"
                value={yesNo(doc.previousInsuranceClaims)}
                tone={doc.previousInsuranceClaims ? 'bad' : 'good'}
              />
              {doc.insuranceClaimDetails && <Row label="Claim details" value={doc.insuranceClaimDetails} />}
            </Panel>

            <Panel title="History & condition">
              <Row
                label="Accident history"
                value={doc.accidentHistory ? `Yes · ${doc.numberOfAccidents || 0} reported` : 'None reported'}
                tone={doc.accidentHistory ? 'bad' : 'good'}
              />
              {doc.accidentDetails && <Row label="Accident details" value={doc.accidentDetails} />}
              <Row
                label="Major repairs"
                value={yesNo(doc.majorRepairs)}
                tone={doc.majorRepairs ? 'bad' : 'good'}
              />
              {doc.repairDetails && <Row label="Repair details" value={doc.repairDetails} />}
              <Row label="Service history" value={doc.serviceHistory} />
              {doc.lastServiceDate && <Row label="Last serviced" value={formatDate(doc.lastServiceDate)} />}
              <Row label="Service book" value={yesNo(doc.serviceBookAvailable)} />
              <Row
                label="Pollution certificate"
                value={doc.pollutionCertificate}
                tone={doc.pollutionCertificate === 'Valid' ? 'good' : 'bad'}
              />
              {doc.pollutionExpiryDate && <Row label="PUC expires" value={formatDate(doc.pollutionExpiryDate)} />}
            </Panel>

            {documents.length > 0 && (
              <Panel title="Uploaded documents" subtitle={`${documents.length} file(s) from the seller`}>
                {documents.map((d) => (
                  <DocLink key={d.label} href={d.url} label={d.label} />
                ))}
              </Panel>
            )}
          </div>

          {/* ── right column: the decision ── */}
          <div className="space-y-6 lg:sticky lg:top-24">

            <div className="hub-bg-midnight rounded-2xl p-5">
              <p className="hub-eyebrow hub-text-midnight-fg-80">Seller&apos;s expected amount</p>
              <p className="hub-display text-3xl mt-1">{formatINR(car.expectedBid)}</p>
            </div>

            <Panel
              title="Mechanic inspection"
              subtitle={hasInspection ? 'Basis for your decision' : 'Not submitted yet'}
            >
              {hasInspection ? (
                <div className="space-y-4">
                  <RatingBar label="Interior condition" value={insp.interiorRating} />
                  <RatingBar label="Engine condition" value={insp.engineRating} />
                  <RatingBar label="Overall condition" value={insp.overallRating} />

                  {insp.additionalNotes && (
                    <div className="hub-bg-secondary-50 rounded-xl p-3 border hub-border-c">
                      <p className="hub-eyebrow hub-text-muted mb-1">Mechanic&apos;s notes</p>
                      <p className="text-sm hub-text-foreground leading-relaxed whitespace-pre-wrap">
                        {insp.additionalNotes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm hub-text-muted">
                  Assign a mechanic and wait for the inspection report. A vehicle cannot be approved
                  until it has been inspected.
                </p>
              )}
            </Panel>

            <Panel title="Final decision" subtitle="Approve to set a starting bid and open the auction">
              {decided ? (
                <p className="text-sm hub-text-muted">
                  This request has already been <strong>{status}</strong>.
                </p>
              ) : (
                <>
                  {actionError && (
                    <div role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {actionError}
                    </div>
                  )}

                  {/* The server refuses BOTH approve and reject while
                      reviewStatus is still pending, so neither is offered as
                      clickable until the inspection lands. */}
                  {!hasInspection && (
                    <p className="text-sm hub-text-muted mb-3">
                      Both decisions unlock once the mechanic submits the inspection report.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowApproveModal(true)}
                    disabled={actionLoading || !hasInspection}
                    className="hub-cta w-full justify-center mb-2 disabled:opacity-50"
                  >
                    {actionLoading ? 'Working...' : 'Approve for auction'}
                  </button>

                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={actionLoading || !hasInspection}
                    className="hub-btn-ghost w-full text-center disabled:opacity-50"
                    style={{ color: 'var(--destructive)' }}
                  >
                    Reject request
                  </button>
                </>
              )}
            </Panel>

            <Panel title="Seller">
              <div className="flex items-center gap-3 mb-3">
                <span
                  aria-hidden="true"
                  className="grid place-items-center h-10 w-10 rounded-full hub-bg-primary-soft font-semibold"
                >
                  {`${seller.firstName?.[0] || ''}${seller.lastName?.[0] || ''}`.toUpperCase() || '?'}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold hub-text-foreground truncate">
                    {`${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'Seller'}
                  </p>
                  <p className="text-xs hub-text-muted truncate">{seller.email}</p>
                </div>
              </div>
              {seller.phone && <Row label="Phone" value={seller.phone} />}
              {seller.city && <Row label="City" value={seller.city} />}
            </Panel>
          </div>
        </div>
      </div>

      <ApproveAuctionModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApproveConfirm}
        suggestedBid={car.expectedBid}
        vehicleName={car.vehicleName}
      />
    </div>
  );
}
