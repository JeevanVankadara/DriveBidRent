import React from 'react';

const getFullName = (user) => {
  if (!user) return '';
  return user.fullName || `${user.firstName || ''}${user.lastName ? ' ' + user.lastName : ''}`.trim();
};

const ChatHeader = ({ otherUser, carName, rentalPeriod, online, chat, currentUserId = null }) => {
  const name = getFullName(otherUser) || otherUser?.firstName || 'User';
  const avatarText = name ? name.charAt(0) : 'U';
  const isCurrentUserMechanic = chat && currentUserId && String(currentUserId) === String(chat.mechanic || '');
  return (
    <div className="flex items-center justify-between p-3 border-b bg-white dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200">{avatarText}</div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">{name}</div>
          {/* Inspection status badge */}
          {chat && chat.type === 'inspection' && (
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isCurrentUserMechanic ? 'bg-orange-500 text-white' : 'bg-indigo-600 text-white'}`}>
                {isCurrentUserMechanic ? 'INSPECTION ASSIGNED' : 'MECHANIC ASSIGNED'}
              </span>
            </div>
          )}
          {/* show auction or rental info when available */}
          {chat && chat.type === 'auction' ? (
            <div className="text-xs text-green-600 dark:text-green-300 font-semibold">Auction Won • ₹{(chat.finalPrice || 0).toLocaleString()}</div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-300">{carName} • {rentalPeriod}</div>
          )}
        </div>
      </div>
      <div className="text-sm text-green-600">{online ? 'Active now' : ''}</div>
    </div>
  );
};

export default ChatHeader;
