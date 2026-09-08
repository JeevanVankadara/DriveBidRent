// client/src/components/BrandLoader.jsx
//
// The DriveBidRent loading screen: a car driving down a road while the app
// works through its start-up stages.
//
// Two variants:
//   <BrandLoader variant="full" ready={bool} />  full-screen splash
//   <BrandLoader />                              inline, for route changes
//
// Progress is deliberately honest — it climbs through the stages but parks at
// 90% until `ready` actually turns true, then completes. It never claims to be
// finished before the backend has answered.
//
// Colours are literal rather than hub CSS variables: the splash renders on the
// public home page, which sits outside every *-layout, so the theme tokens are
// not in scope there.
import { useEffect, useRef, useState } from 'react';

const CREAM = 'oklch(0.955 0.033 76.5)';
const CARD = 'oklch(0.975 0.021 78)';
const PRIMARY = 'oklch(0.7 0.19 47)';
const PRIMARY_DEEP = 'oklch(0.52 0.19 42)';
const MIDNIGHT = 'oklch(0.19 0.03 264)';
const MUTED = 'oklch(0.52 0.035 60)';
const BORDER = 'oklch(0.87 0.045 75)';

const STAGES = [
  'Starting the engine',
  'Connecting to the server',
  'Loading live auctions',
  'Almost there',
];

const CSS = `
@keyframes dbr-road {
  from { background-position-x: 0; }
  to   { background-position-x: -48px; }
}
@keyframes dbr-wheel {
  to { transform: rotate(360deg); }
}
@keyframes dbr-bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-2px); }
}
@keyframes dbr-fade-up {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .dbr-road, .dbr-wheel, .dbr-car { animation: none !important; }
}
`;

/* The car itself — wheels spin, body bobs. */
function Car({ size = 56 }) {
  const wheel = {
    transformOrigin: 'center',
    animation: 'dbr-wheel 0.6s linear infinite',
  };
  return (
    <svg
      className="dbr-car"
      width={size}
      height={size * 0.5}
      viewBox="0 0 112 56"
      fill="none"
      aria-hidden="true"
      style={{ animation: 'dbr-bob 0.9s ease-in-out infinite', display: 'block' }}
    >
      {/* body */}
      <path
        d="M8 40c0-3 2-6 6-7l8-2 10-11c2-2 5-3 8-3h20c3 0 6 1 8 4l7 10 12 3c5 1 8 3 8 7v3c0 2-2 4-4 4H12c-2 0-4-2-4-4v-4z"
        fill={PRIMARY}
      />
      {/* windows */}
      <path d="M36 22h11v10H28l8-10z" fill={CREAM} opacity="0.92" />
      <path d="M52 22h9c1 0 2 0 3 2l6 8H52V22z" fill={CREAM} opacity="0.92" />
      {/* wheels */}
      <g style={wheel}>
        <circle cx="32" cy="44" r="9" fill={MIDNIGHT} />
        <circle cx="32" cy="44" r="3.2" fill={CARD} />
        <rect x="31" y="36" width="2" height="16" rx="1" fill={CARD} opacity="0.6" />
      </g>
      <g style={wheel}>
        <circle cx="80" cy="44" r="9" fill={MIDNIGHT} />
        <circle cx="80" cy="44" r="3.2" fill={CARD} />
        <rect x="79" y="36" width="2" height="16" rx="1" fill={CARD} opacity="0.6" />
      </g>
    </svg>
  );
}

/* The road the car drives along; also doubles as the progress track. */
function Road({ progress, showCar = true }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {showCar && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: `calc(${progress}% - 28px)`,
            transition: 'left 700ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <Car />
        </div>
      )}

      <div
        style={{
          marginTop: showCar ? 44 : 0,
          height: 10,
          borderRadius: 999,
          background: MIDNIGHT,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* travelled portion */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${progress}%`,
            background: PRIMARY,
            opacity: 0.28,
            transition: 'width 700ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        {/* lane markings */}
        <div
          className="dbr-road"
          style={{
            position: 'absolute',
            inset: 0,
            top: 4,
            height: 2,
            backgroundImage: `repeating-linear-gradient(to right, ${CARD} 0 24px, transparent 24px 48px)`,
            backgroundSize: '48px 2px',
            opacity: 0.5,
            animation: 'dbr-road 0.6s linear infinite',
          }}
        />
      </div>
    </div>
  );
}

export default function BrandLoader({ variant = 'inline', ready = false, label }) {
  const isFull = variant === 'full';
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(6);
  const doneRef = useRef(false);

  /* Walk through the stages, but hold at 90% until the app is really ready. */
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        if (doneRef.current) return 100;
        if (p >= 90) return 90;
        // ease off as it approaches the cap, so it never looks stalled
        return Math.min(90, p + Math.max(1.5, (90 - p) * 0.08));
      });
    }, 220);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isFull) return undefined;
    const id = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 1900);
    return () => clearInterval(id);
  }, [isFull]);

  useEffect(() => {
    if (ready) {
      doneRef.current = true;
      setProgress(100);
      setStage(STAGES.length - 1);
    }
  }, [ready]);

  /* ── inline: a compact strip for route-level loading ── */
  if (!isFull) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label || 'Loading'}
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: '2rem 1.5rem',
        }}
      >
        <style>{CSS}</style>
        <div style={{ width: 'min(280px, 70vw)' }}>
          <Road progress={progress} />
        </div>
        <p style={{ margin: 0, fontSize: 13, color: MUTED, fontWeight: 500 }}>
          {label || 'Loading…'}
        </p>
      </div>
    );
  }

  /* ── full: the first-visit splash ── */
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: CREAM,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: '"Poppins", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <style>{CSS}</style>

      <div style={{ width: 'min(460px, 100%)' }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PRIMARY_DEEP,
          }}
        >
          Buy · Bid · Rent
        </p>

        <h1
          style={{
            margin: '6px 0 0',
            fontFamily: '"Playfair Display", ui-serif, Georgia, serif',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(2rem, 6vw, 2.75rem)',
            color: MIDNIGHT,
            lineHeight: 1.05,
          }}
        >
          Drive<span style={{ color: PRIMARY_DEEP }}>Bid</span>Rent
        </h1>

        <div style={{ marginTop: 36 }}>
          <Road progress={progress} />
        </div>

        {/* stage list — the current one lights up */}
        <ul
          style={{
            listStyle: 'none',
            margin: '22px 0 0',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {STAGES.map((text, i) => {
            const current = i === stage;
            const passed = i < stage || progress === 100;
            return (
              <li
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 14,
                  fontWeight: current ? 600 : 500,
                  color: current ? MIDNIGHT : passed ? MUTED : BORDER,
                  transition: 'color 300ms ease',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    flexShrink: 0,
                    background: current || passed ? PRIMARY : BORDER,
                    transition: 'background 300ms ease',
                  }}
                />
                <span style={current ? { animation: 'dbr-fade-up 300ms ease' } : undefined}>
                  {text}
                </span>
              </li>
            );
          })}
        </ul>

        <p style={{ margin: '22px 0 0', fontSize: 12, color: MUTED }}>
          First load can take a moment while the server wakes up.
        </p>
      </div>
    </div>
  );
}
