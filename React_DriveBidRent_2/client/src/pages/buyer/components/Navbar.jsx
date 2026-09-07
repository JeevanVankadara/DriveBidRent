// client/src/pages/buyer/components/Navbar.jsx
// Buyer links + unread badges, rendered by the shared HubNavbar so every
// dashboard shares one navbar design.
import { useState, useEffect } from 'react';
import useProfile from '../../../hooks/useProfile';
import { getUnreadNotificationCount } from '../../../services/buyer.services';
import axiosInstance from '../../../utils/axiosInstance.util';
import HubNavbar from '../../../components/hub/HubNavbar';

export default function Navbar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  const { profile } = useProfile();

  const loadChatUnread = async () => {
    try {
      const r = await axiosInstance.get('/chat/my-chats');
      const chats = r.data?.data || [];
      const sum = chats.reduce((acc, c) => acc + (c.unreadCount || c.unread || 0), 0);
      setChatUnreadCount(sum);
    } catch (err) {
      // ignore chat unread errors
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
        await loadChatUnread();
      } catch (err) {
        console.error('Navbar load failed:', err);
      }
    };

    // Initial load only
    loadData();
  }, [profile]);

  useEffect(() => {
    // Listen for notificationsSeen event to refresh badge
    const handler = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
        await loadChatUnread();
      } catch (err) {
        console.error('Failed to refresh profile after notificationsSeen', err);
      }
    };

    window.addEventListener('notificationsSeen', handler);
    return () => window.removeEventListener('notificationsSeen', handler);
  }, []);

  // update chat unread badge when a chat is marked read
  useEffect(() => {
    const onRead = (e) => {
      try {
        const { updated } = e.detail || {};
        setChatUnreadCount((prev) => Math.max(0, prev - (updated || 0)));
      } catch (err) { }
    };
    window.addEventListener('chatRead', onRead);
    return () => window.removeEventListener('chatRead', onRead);
  }, []);

  // update chat unread badge when a chat is deleted
  useEffect(() => {
    const onDeleted = () => {
      loadChatUnread().catch((err) =>
        console.error('Failed to refresh chat count after deletion:', err)
      );
    };
    window.addEventListener('chatDeleted', onDeleted);
    return () => window.removeEventListener('chatDeleted', onDeleted);
  }, []);

  const links = [
    { to: '/buyer/purchases', label: 'My Purchases' },
    { to: '/buyer/wishlist', label: 'Wishlist' },
    { to: '/buyer/my-bids', label: 'My Bids' },
    { to: '/buyer/notifications', label: 'Notifications', badge: unreadCount },
    { to: '/buyer/about', label: 'About Us' },
    { to: '/buyer/chats', label: 'Chat', badge: chatUnreadCount },
  ];

  return (
    <HubNavbar
      homePath="/buyer"
      links={links}
      profilePath="/buyer/profile"
    />
  );
}
