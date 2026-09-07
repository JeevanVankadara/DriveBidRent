// client/src/pages/auctionManager/components/Navbar.jsx
// Auction manager links, rendered by the shared HubNavbar so every
// dashboard shares one navbar design.
import HubNavbar from '../../../components/hub/HubNavbar';

const links = [
  { to: '/auctionmanager/dashboard', label: 'Dashboard' },
  { to: '/auctionmanager/requests', label: 'Requests' },
  { to: '/auctionmanager/pending', label: 'Pending Cars' },
  { to: '/auctionmanager/approved', label: 'Approved Cars' },
  { to: '/auctionmanager/chats', label: 'Chats' },
];

export default function Navbar() {
  return (
    <HubNavbar
      homePath="/auctionmanager/dashboard"
      roleLabel="Auction Manager"
      links={links}
      profilePath="/auctionmanager/profile"
    />
  );
}
