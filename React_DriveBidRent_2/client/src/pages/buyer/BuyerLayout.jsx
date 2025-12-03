// client/src/pages/buyer/BuyerLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from '../components/Footer';

export default function BuyerLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}