// client/src/pages/mechanic/components/MechanicNavbar.jsx
// Mechanic links, rendered by the shared HubNavbar so every dashboard
// shares one navbar design.
import HubNavbar from '../../../components/hub/HubNavbar';

const links = [
  { to: '/mechanic/dashboard', label: 'Dashboard' },
  { to: '/mechanic/current-tasks', label: 'Current Tasks' },
  { to: '/mechanic/past-tasks', label: 'Past Tasks' },
  { to: '/mechanic/chats', label: 'Chats' },
];

export default function MechanicNavbar() {
  return (
    <HubNavbar
      homePath="/mechanic/dashboard"
      roleLabel="Mechanic"
      links={links}
      profilePath="/mechanic/profile"
    />
  );
}
