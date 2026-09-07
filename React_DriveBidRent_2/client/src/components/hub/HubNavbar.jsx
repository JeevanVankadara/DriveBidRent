// client/src/components/hub/HubNavbar.jsx
//
// The one navbar every dashboard renders (buyer, seller, admin, superadmin,
// mechanic, auction manager). Styling lives in styles/HubTheme.css, so the
// look is identical everywhere; each section only supplies its own links.
//
// Props:
//   homePath     - where the logo links to
//   roleLabel    - optional chip beside the logo ("Seller", "Admin", ...)
//   links        - [{ to, label, badge?, match? }]  badge: number, match: path prefix
//   profilePath  - optional; renders the outlined "Profile" button
//   profileLabel - label for that button (default "Profile")
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import '../../styles/HubTheme.css';

export default function HubNavbar({
  homePath = '/',
  roleLabel = '',
  links = [],
  profilePath = '',
  profileLabel = 'Profile',
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('user');
      navigate('/', { replace: true });
    }
  };

  // A link is active on an exact match, or when the current path sits under
  // the `match` prefix a caller supplied (detail pages, nested routes).
  const isActive = (link) => {
    const path = link.match || link.to;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="hub-navbar sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-10">
        <div className="flex justify-between items-center gap-6 h-16 sm:h-20">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link to={homePath} className="hub-logo text-2xl">
              Drive<span className="hub-logo-mid">Bid</span>Rent
            </Link>
            {roleLabel && (
              <span className="hub-role-chip hidden sm:inline-block">{roleLabel}</span>
            )}
          </div>

          {/* Center links */}
          <div className="hidden lg:flex items-center gap-7">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`hub-nav-link ${isActive(link) ? 'active' : ''}`}
              >
                {link.label}
                {link.badge > 0 && (
                  <span className="hub-nav-badge ml-2">{link.badge}</span>
                )}
              </Link>
            ))}
          </div>

          {/* Right side: profile + logout */}
          <div className="hidden lg:flex items-center gap-3">
            {profilePath && (
              <Link
                to={profilePath}
                className={`hub-nav-profile ${
                  location.pathname === profilePath ? 'active' : ''
                }`}
              >
                {profileLabel}
              </Link>
            )}
            <button onClick={handleLogout} className="hub-nav-logout">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="lg:hidden hub-mobile-nav py-2 px-2">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`hub-mobile-link ${isActive(link) ? 'active' : ''}`}
            >
              {link.label}
              {link.badge > 0 && (
                <span className="hub-nav-badge ml-1">{link.badge}</span>
              )}
            </Link>
          ))}
          {profilePath && (
            <Link to={profilePath} className="hub-text-primary font-medium">
              {profileLabel}
            </Link>
          )}
          <button onClick={handleLogout} className="hub-text-primary font-medium">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
