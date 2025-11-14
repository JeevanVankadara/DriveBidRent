import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../hooks/useBuyerHooks'; // Updated import path

export default function Notifications() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    
    if (!confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      return;
    }

    try {
      await markAllAsRead();
      showMessage('All notifications have been cleared successfully!', 'success');
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      showMessage('Failed to clear notifications', 'error');
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'outbid': return '⚡';
      case 'auction_ended': return '⏰';
      case 'auction_won': return '🏆';
      default: return '🔔';
    }
  };

  const getNotificationActions = (notification) => {
    if (notification.auctionId && notification.type === 'outbid') {
      return (
        <div className="notification-actions">
          <Link to={`/buyer/auctions/${notification.auctionId._id || notification.auctionId}`} className="btn btn-primary">
            View Auction
          </Link>
          <Link to={`/buyer/auctions/${notification.auctionId._id || notification.auctionId}`} className="btn btn-secondary">
            Place New Bid
          </Link>
        </div>
      );
    } else if (notification.auctionId && notification.type === 'auction_won') {
      return (
        <div className="notification-actions">
          <Link to="/buyer/purchases" className="btn btn-primary">
            Go to My Purchases
          </Link>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="text-center py-10">Loading notifications...</div>;

  return (
    <div className="notifications-container">
      <div className="page-header">
        <h1>Notifications</h1>
        <button 
          className="mark-all-read" 
          onClick={handleMarkAllRead}
          disabled={notifications.length === 0}
        >
          Clear All Notifications
        </button>
      </div>

      {message && (
        <div className={`alert-message alert-${messageType}`}>
          {message}
        </div>
      )}

      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification._id}
              className={`notification-card ${notification.isRead ? '' : 'unread'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className={`notification-icon icon-${notification.type}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
                {getNotificationActions(notification)}
              </div>
            </div>
          ))
        ) : (
          <div className="no-notifications">
            <h3>No Notifications</h3>
            <p>You don't have any notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}