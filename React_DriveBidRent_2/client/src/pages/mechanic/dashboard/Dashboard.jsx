// client/src/pages/mechanic/dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import { getDashboard } from '../../../services/mechanic.services';
import CurrentTaskCard from '../components/CurrentTaskCard';
import PastTaskCard from '../components/PastTaskCard';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import MechanicDashboardVisuals from './MechanicDashboardVisuals';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 font-montserrat">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md border border-red-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mb-3">Connection Error</p>
          <p className="text-gray-600 mb-8 font-medium">Failed to load dashboard data</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-900 hover:bg-orange-500 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-sm hover:shadow-md"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { showApprovalPopup, displayedVehicles = [], completedTasks = [] } = data;

  const upcomingInspections = displayedVehicles.filter(v => {
    if (v.inspectionStatus !== 'scheduled' || !v.inspectionDate) return false;
    const inspectDate = new Date(v.inspectionDate);
    const now = new Date();
    const diffHours = (inspectDate - now) / (1000 * 60 * 60);
    return diffHours >= -24 && diffHours <= 48; // upcoming in next 48 or missed by today
  });

  return (
    <div className="min-h-screen font-montserrat" style={{ background: '#f8fafc' }}>
      
      {/* ── HERO — full-width dark banner matching Auction Manager style ── */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0c1220 0%, #111827 50%, #0c1628 100%)',
        paddingTop: 80,
        paddingBottom: 60,
        overflow: 'hidden',
      }}>
        {/* Floating orbs */}
        {[
          { top: '20%', left: '5%', size: 200, color: 'rgba(59,130,246,0.08)', delay: '0s' },
          { top: '55%', left: '65%', size: 260, color: 'rgba(249,115,22,0.07)', delay: '1.2s' },
          { top: '10%', left: '80%', size: 130, color: 'rgba(16,185,129,0.05)', delay: '0.6s' },
        ].map((orb, i) => (
          <div key={i} style={{
            position: 'absolute', top: orb.top, left: orb.left,
            width: orb.size, height: orb.size, borderRadius: '50%',
            background: orb.color, filter: 'blur(40px)',
            animationDelay: orb.delay, pointerEvents: 'none',
          }} />
        ))}
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', position: 'relative' }}>
          
          {showApprovalPopup && (
            <div className="mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-4 backdrop-blur-sm">
              <div className="p-2 bg-orange-500/20 rounded-xl text-orange-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className="text-orange-400 font-bold mb-1">Account Under Review</h3>
                <p className="text-gray-400 text-sm">Your profile is being verified by the admin team. You'll receive full access once approved.</p>
              </div>
            </div>
          )}

          {upcomingInspections.length > 0 && (
            <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-4 backdrop-blur-sm shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className="text-blue-400 font-bold mb-1">
                  Upcoming Inspections ({upcomingInspections.length})
                </h3>
                <p className="text-gray-400 text-sm font-medium">
                  You have vehicle inspections scheduled soon. Please check your assigned tasks and sync with your calendar.
                </p>
                <div className="mt-3 flex gap-2">
                  {upcomingInspections.map(v => (
                    <Link key={v._id} to={`/mechanic/car-details/${v._id}`} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-blue-300 text-xs font-bold rounded-lg transition-colors border border-white/5">
                      {v.vehicleName}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32 }}>
            {/* Left: title */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)',
                padding: '6px 14px', borderRadius: 100, marginBottom: 16,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Mechanic Portal</span>
              </div>
              <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.05, marginBottom: 12 }}>
                Mechanic{' '}
                <span style={{ color: '#3b82f6', fontStyle: 'italic' }}>Dashboard</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 420, lineHeight: 1.7 }}>
                Manage your assigned vehicle inspections and view completed reports.
              </p>
            </div>

            {/* Right: stat pills */}
            <div style={{ display: 'flex', gap: 12 }}>
              {/* Current Tasks */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 16, background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.3)' }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#60a5fa', lineHeight: 1 }}>{displayedVehicles.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(96,165,250,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Current Tasks</div>
                </div>
                <div style={{ width: 1, height: 36, background: 'rgba(59,130,246,0.2)' }} />
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18, color: '#60a5fa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>

              {/* Completed Tasks */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{completedTasks.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Completed</div>
                </div>
                <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)' }} />
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18, color: '#34d399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Total Tasks */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{displayedVehicles.length + completedTasks.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Total Tasks</div>
                </div>
                <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)' }} />
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18, color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto pb-24 px-4 pt-12">

        {/* ==================== VISUAL ANALYTICS ==================== */}
        <MechanicDashboardVisuals currentTasks={displayedVehicles} completedTasks={completedTasks} />

        {/* ==================== CURRENT ASSIGNMENTS ==================== */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 px-2 lg:px-4">Current Assignments</h2>
            {displayedVehicles.length > 0 && (
              <Link to="/mechanic/current-tasks" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold rounded-xl transition duration-300 shadow-sm">
                View All
              </Link>
            )}
          </div>

          {displayedVehicles.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No vehicles assigned</h3>
              <p className="text-gray-500">You currently have no tasks assigned to you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedVehicles.map(v => <CurrentTaskCard key={v._id} vehicle={v} />)}
            </div>
          )}
        </section>

        {/* ==================== COMPLETED INSPECTIONS ==================== */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 px-2 lg:px-4">Completed Inspections</h2>
            {completedTasks.length > 0 && (
              <Link to="/mechanic/past-tasks" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold rounded-xl transition duration-300 shadow-sm">
                View All
              </Link>
            )}
          </div>

          {completedTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No completed tasks yet</h3>
              <p className="text-gray-500">Your completed inspection reports will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedTasks.slice(0, 6).map(v => <PastTaskCard key={v._id} vehicle={v} />)}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}