// client/src/pages/admin/AdminLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from '../../components/hub/HubFooter';
import './AdminDashboard.css';
import '../../styles/HubTheme.css';
import '../../styles/HubDashboards.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow relative" style={{ zIndex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AdminLayout;
