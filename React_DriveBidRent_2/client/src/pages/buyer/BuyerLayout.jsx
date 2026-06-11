// client/src/pages/buyer/BuyerLayout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from '../components/Footer';
import BuyerRagChatbot from '../../features/buyerRagChatbot/BuyerRagChatbot';
import './BuyerDashboard.css';

export default function BuyerLayout() {
  const { pathname } = useLocation();
  const isLiveAuctionRoom = pathname.startsWith('/buyer/live-auction/');

  return (
    <div className="buyer-layout min-h-screen flex flex-col">
      {!isLiveAuctionRoom && <Navbar />}
      <main className="flex-grow relative" style={{ zIndex: 1 }}>
        <Outlet />
      </main>
      {!isLiveAuctionRoom && <BuyerRagChatbot />}
      {!isLiveAuctionRoom && <Footer />}
    </div>
  );
}
