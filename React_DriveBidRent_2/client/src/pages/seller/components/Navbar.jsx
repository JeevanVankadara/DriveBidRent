// client/src/pages/seller/components/Navbar.jsx
// Seller links + chat unread badge, rendered by the shared HubNavbar so
// every dashboard shares one navbar design.
import { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance.util';
import HubNavbar from '../../../components/hub/HubNavbar';

export default function Navbar() {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadChats = async () => {
      try {
        const r = await axiosInstance.get('/chat/my-chats');
        if (!mounted) return;
        const chats = r.data?.data || [];
        const sum = chats.reduce((acc, c) => acc + (c.unreadCount || c.unread || 0), 0);
        setChatUnreadCount(sum);
      } catch (err) {
        // ignore
      }
    };
    loadChats();
    const id = setInterval(loadChats, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // update unread badge when a chat is read elsewhere
  useEffect(() => {
    const handler = (e) => {
      try {
        const { updated } = e.detail || {};
        setChatUnreadCount((prev) => Math.max(0, prev - (updated || 0)));
      } catch (err) {}
    };
    window.addEventListener('chatRead', handler);
    return () => window.removeEventListener('chatRead', handler);
  }, []);

  // update chat unread badge when a chat is deleted
  useEffect(() => {
    const onDeleted = async () => {
      try {
        const r = await axiosInstance.get('/chat/my-chats');
        const chats = r.data?.data || [];
        const sum = chats.reduce((acc, c) => acc + (c.unreadCount || c.unread || 0), 0);
        setChatUnreadCount(sum);
      } catch (err) {
        console.error('Failed to refresh chat count after deletion:', err);
      }
    };
    window.addEventListener('chatDeleted', onDeleted);
    return () => window.removeEventListener('chatDeleted', onDeleted);
  }, []);

  const links = [
    { to: '/seller/dashboard', label: 'Dashboard' },
    { to: '/seller/add-auction', label: 'Add Auction' },
    { to: '/seller/view-auctions', label: 'View Auctions' },
    { to: '/seller/add-rental', label: 'Add Rental' },
    { to: '/seller/view-rentals', label: 'View Rentals' },
    { to: '/seller/chats', label: 'Chat', badge: chatUnreadCount },
    { to: '/seller/view-earnings', label: 'Earnings' },
  ];

  return (
    <HubNavbar
      homePath="/seller/dashboard"
      roleLabel="Seller"
      links={links}
      profilePath="/seller/profile"
    />
  );
}
