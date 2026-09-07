// client/src/pages/superadmin/SuperAdminLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from '../../components/hub/HubFooter';
import './SuperAdminDashboard.css';
import '../../styles/HubTheme.css';
import '../../styles/HubDashboards.css';

const SuperAdminLayout = () => {
  return (
    <div className="superadmin-layout min-h-screen flex flex-col">
      <Navbar />
      <main className="superadmin-main-content flex-grow relative" style={{ zIndex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default SuperAdminLayout;
