// client/src/pages/mechanic/MechanicLayout.jsx
import { Outlet } from 'react-router-dom';
import MechanicNavbar from './components/MechanicNavbar';
import MechanicFooter from '../components/Footer';

export default function MechanicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <MechanicNavbar />
      <main className="flex-grow pt-16">
        <Outlet />   {/* All mechanic pages load here with their own spinners */}
      </main>
      <MechanicFooter />
    </div>
  );
}