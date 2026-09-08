// client/src/pages/mechanic/dashboard/Dashboard.jsx
//
// Rebuilt on the shared Hub theme (cream canvas, Playfair headings, warm
// cards) so the mechanic section matches the rest of the app. The previous
// version was a dark navy hero with blurred orbs, which clashed badly once
// every other dashboard moved to the cream palette.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../../services/mechanic.services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getVehicleCoverImageUrl } from '../../../utils/vehicleImage.util';
import {
  Wrench, CheckCircle2, ClipboardList, AlertTriangle,
  Calendar, ArrowRight, RefreshCw, Star,
} from 'lucide-react';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

/* ── Small building blocks ─────────────────────────────────────── */

function StatTile({ icon, label, value, hint }) {
  // Aliased to a capitalised local so JSX treats it as a component.
  const Icon = icon;
  return (
    <div className="hub-surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="hub-eyebrow hub-text-muted">{label}</p>
          <p className="hub-display text-3xl mt-1.5 hub-text-foreground">{value}</p>
          {hint && <p className="text-xs hub-text-muted mt-1">{hint}</p>}
        </div>
        <span className="hub-bg-primary-soft rounded-xl p-2.5 shrink-0">
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

function Notice({ tone = 'primary', icon, title, children }) {
  const Icon = icon;
  const bg = tone === 'primary' ? 'hub-bg-primary-soft' : 'hub-bg-rent-soft';
  return (
    <div className={`${bg} rounded-2xl p-4 flex items-start gap-3`}>
      <Icon size={20} className="shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <div className="text-sm mt-0.5 opacity-90">{children}</div>
      </div>
    </div>
  );
}

function VehicleRow({ vehicle, cta, to, badge }) {
  const image = getVehicleCoverImageUrl(vehicle);
  const rating = vehicle.multipointInspection?.overallRating;

  return (
    <Link to={to} className="hub-surface-card p-3 flex items-center gap-4 hover:shadow-lg transition-shadow">
      {image ? (
        <img
          src={image}
          alt={vehicle.vehicleName}
          className="h-20 w-28 rounded-xl object-cover shrink-0"
          loading="lazy"
        />
      ) : (
        <div className="h-20 w-28 rounded-xl hub-bg-secondary grid place-items-center shrink-0">
          <Wrench size={20} className="hub-text-muted" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold hub-text-foreground truncate">{vehicle.vehicleName}</p>
          {badge && <span className="hub-card-badge hub-bg-primary-soft !static">{badge}</span>}
        </div>
        <p className="text-sm hub-text-muted mt-0.5">
          {vehicle.year} · {Number(vehicle.mileage || 0).toLocaleString('en-IN')} km · {vehicle.fuelType}
        </p>
        {rating ? (
          <p className="text-sm hub-text-primary font-semibold mt-1 flex items-center gap-1">
            <Star size={14} /> {rating}/5 overall
          </p>
        ) : vehicle.inspectionDate ? (
          <p className="text-sm hub-text-muted mt-1 flex items-center gap-1">
            <Calendar size={14} /> {formatDate(vehicle.inspectionDate)}
            {vehicle.inspectionTime ? ` · ${vehicle.inspectionTime}` : ''}
          </p>
        ) : null}
      </div>

      <span className="hub-text-primary text-sm font-medium hidden sm:flex items-center gap-1 shrink-0">
        {cta} <ArrowRight size={15} />
      </span>
    </Link>
  );
}

function Section({ title, description, action, children }) {
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="hub-display text-2xl">{title}</h2>
          {description && <p className="hub-text-muted text-sm mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyPanel({ icon, title, text }) {
  const Icon = icon;
  return (
    <div className="hub-empty text-center">
      <Icon size={26} className="hub-text-muted mb-3" />
      <p className="font-semibold hub-text-foreground">{title}</p>
      <p className="text-sm hub-text-muted mt-1 max-w-sm">{text}</p>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (failed || !data) {
    return (
      <div className="min-h-[70vh] grid place-items-center px-4">
        <div className="hub-surface-card p-10 text-center max-w-sm">
          <span className="hub-bg-primary-soft rounded-2xl p-3 inline-flex mb-4">
            <AlertTriangle size={24} />
          </span>
          <h2 className="hub-display text-xl mb-1">Couldn&apos;t load your dashboard</h2>
          <p className="text-sm hub-text-muted mb-6">
            The server didn&apos;t respond. Check your connection and try again.
          </p>
          <button onClick={() => window.location.reload()} className="hub-cta w-full justify-center">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    user,
    showApprovalPopup,
    displayedVehicles = [],
    assignedVehicles = [],
    completedTasks = [],
    allCompletedTasks = [],
  } = data;

  const assignedCount = assignedVehicles.length || displayedVehicles.length;
  const completedCount = allCompletedTasks.length || completedTasks.length;

  const ratings = allCompletedTasks
    .map((t) => t.multipointInspection?.overallRating)
    .filter((n) => Number.isFinite(n));
  const avgRating = ratings.length
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : '—';

  const upcoming = displayedVehicles.filter((v) => {
    if (v.inspectionStatus !== 'scheduled' || !v.inspectionDate) return false;
    const hours = (new Date(v.inspectionDate) - new Date()) / 36e5;
    return hours >= -24 && hours <= 48;
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-10">

        <header>
          <span className="hub-eyebrow hub-text-primary">Mechanic</span>
          <h1 className="hub-display text-4xl mt-1">
            {user?.firstName ? `Welcome back, ${user.firstName}` : 'Your workshop'}
          </h1>
          <p className="hub-text-muted mt-2">
            Vehicles assigned to you for inspection, and the reports you have already filed.
          </p>
        </header>

        {(showApprovalPopup || upcoming.length > 0) && (
          <div className="mt-6 space-y-3">
            {showApprovalPopup && (
              <Notice tone="primary" icon={AlertTriangle} title="Account under review">
                An admin is verifying your profile. You&apos;ll get full access once approved.
              </Notice>
            )}
            {upcoming.length > 0 && (
              <Notice tone="rent" icon={Calendar} title="Inspection coming up">
                {upcoming.map((v) => v.vehicleName).join(', ')} — scheduled within the next 48 hours.
              </Notice>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <StatTile icon={ClipboardList} label="Assigned" value={assignedCount} hint="Waiting on your inspection" />
          <StatTile icon={CheckCircle2} label="Completed" value={completedCount} hint="Reports filed" />
          <StatTile icon={Star} label="Avg. rating given" value={avgRating} hint="Overall, out of 5" />
        </div>

        <Section
          title="Assigned to you"
          description="Inspect the vehicle, then submit your report."
          action={
            assignedCount > 0 && (
              <Link to="/mechanic/current-tasks" className="hub-btn-ghost whitespace-nowrap">
                View all
              </Link>
            )
          }
        >
          {displayedVehicles.length > 0 ? (
            <div className="space-y-3">
              {displayedVehicles.map((v) => (
                <VehicleRow
                  key={v._id}
                  vehicle={v}
                  to={`/mechanic/car-details/${v._id}`}
                  cta="Inspect"
                  badge={v.inspectionStatus === 'scheduled' ? 'Scheduled' : null}
                />
              ))}
            </div>
          ) : (
            <EmptyPanel
              icon={Wrench}
              title="Nothing assigned right now"
              text="When an auction manager assigns you a vehicle, it will show up here."
            />
          )}
        </Section>

        <Section
          title="Recently completed"
          description="Reports you have already submitted."
          action={
            completedCount > 0 && (
              <Link to="/mechanic/past-tasks" className="hub-btn-ghost whitespace-nowrap">
                View all
              </Link>
            )
          }
        >
          {completedTasks.length > 0 ? (
            <div className="space-y-3">
              {completedTasks.map((v) => (
                <VehicleRow
                  key={v._id}
                  vehicle={v}
                  to={`/mechanic/car-details/${v._id}`}
                  cta="View report"
                />
              ))}
            </div>
          ) : (
            <EmptyPanel
              icon={CheckCircle2}
              title="No completed inspections yet"
              text="Your submitted reports will be listed here."
            />
          )}
        </Section>

      </div>
    </div>
  );
}
