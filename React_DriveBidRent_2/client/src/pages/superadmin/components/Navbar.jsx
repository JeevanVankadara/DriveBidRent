// client/src/pages/superadmin/components/Navbar.jsx
// Super admin links, rendered by the shared HubNavbar. This replaces the
// old fixed dark sidebar so the section matches every other dashboard.
import HubNavbar from '../../../components/hub/HubNavbar';

const links = [
  { to: '/superadmin/dashboard', label: 'Dashboard' },
  { to: '/superadmin/analytics', label: 'Analytics' },
  { to: '/superadmin/user-activities', label: 'Users' },
  { to: '/superadmin/revenue', label: 'Revenue' },
  { to: '/superadmin/trends', label: 'Trends' },
];

export default function Navbar() {
  return (
    <HubNavbar
      homePath="/superadmin/dashboard"
      roleLabel="Super Admin"
      links={links}
      profilePath="/superadmin/profile"
    />
  );
}
