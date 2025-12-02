// client/src/pages/buyer/BuyerLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function BuyerLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* 90% Scale - Makes everything feel light & premium */}
      <div className="scale-[0.93] origin-top-left w-[107.52688172%] flex-grow flex flex-col">
        <main className="flex-grow">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}