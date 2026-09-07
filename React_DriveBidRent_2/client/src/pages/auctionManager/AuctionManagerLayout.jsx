// client/src/pages/auctionManager/AuctionManagerLayout.jsx
import { Outlet } from 'react-router-dom';
import { Component } from 'react';
import Navbar from './components/Navbar';
import Footer from '../../components/hub/HubFooter';
import '../../styles/HubTheme.css';
import '../../styles/HubDashboards.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auctionmanager-layout min-h-screen flex items-center justify-center">
          <div className="hub-surface-card text-center p-8">
            <h1 className="hub-display text-2xl mb-4">Something went wrong</h1>
            <p className="hub-text-muted mb-4">{this.state.error?.message || 'Unknown error'}</p>
            <button onClick={() => window.location.reload()} className="hub-cta">
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function AuctionManagerLayout() {
  return (
    <ErrorBoundary>
      <div className="auctionmanager-layout min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 relative z-10 w-full">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
