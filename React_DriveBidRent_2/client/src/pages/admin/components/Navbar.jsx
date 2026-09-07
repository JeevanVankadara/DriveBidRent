// client/src/pages/admin/components/Navbar.jsx
// Admin links, rendered by the shared HubNavbar so every dashboard
// shares one navbar design.
import HubNavbar from '../../../components/hub/HubNavbar';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/manage-users', label: 'Manage Users' },
  { to: '/admin/manage-earnings', label: 'Earnings' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/auction-managers', label: 'Auction Managers' },
];

export default function Navbar() {
  return (
    <HubNavbar
      homePath="/admin/dashboard"
      roleLabel="Admin"
      links={links}
      profilePath="/admin/admin-profile"
      profileLabel="My Profile"
    />
  );
}
