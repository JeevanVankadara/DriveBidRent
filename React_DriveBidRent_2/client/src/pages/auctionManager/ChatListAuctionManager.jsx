import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';
import { Link } from 'react-router-dom';
import InspectionChatListItem from '../../components/inspection/InspectionChatListItem';

export default function ChatListAuctionManager({ onSelect, selectedId }) {
  const [chats, setChats] = useState([]);
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')?._id;

  useEffect(() => {
    (async () => {
      const res = await axiosInstance.get('/inspection-chat/my-chats');
      setChats(res.data.data || []);
    })();
  }, []);

  useEffect(() => {
    const handler = () => setChats(prev => [...prev]);
    window.addEventListener('chatRead', handler);
    return () => window.removeEventListener('chatRead', handler);
  }, []);

  return (
    <div className="w-80 border-r bg-white flex flex-col">
      <div className="p-5 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Assigned Mechanics</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => {
          const isSelected = String(selectedId) === String(chat._id);
          return onSelect ? (
            <div
              key={chat._id}
              onClick={() => onSelect(chat._id)}
              className={`p-3 border-b transition-all cursor-pointer ${
                isSelected ? 'bg-orange-50 border-orange-300' : 'hover:bg-gray-50'
              }`}
            >
              <InspectionChatListItem chat={chat} isSelected={isSelected} viewerIsBuyer={false} currentUserId={currentUserId} />
            </div>
          ) : (
            <Link key={chat._id} to={`/auctionmanager/chats/${chat._id}`}>
              <div className={`p-3 border-b transition-all ${isSelected ? 'bg-orange-50 border-orange-300' : 'hover:bg-gray-50'}`}>
                <InspectionChatListItem chat={chat} isSelected={isSelected} viewerIsBuyer={false} currentUserId={currentUserId} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}