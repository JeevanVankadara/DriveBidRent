import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatListBuyer from './ChatListBuyer';
import ChatRoomBuyer from './ChatRoomBuyer';

export default function ChatPageBuyer() {
  const { chatId: chatIdFromParam } = useParams();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState(chatIdFromParam || null);

  useEffect(() => {
    // keep selected in sync with URL param
    setSelectedChatId(chatIdFromParam || null);
  }, [chatIdFromParam]);

  const handleSelect = (id) => {
    setSelectedChatId(id);
    navigate(`/buyer/chats/${id}`);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      <aside className="w-80 border-r">
        <ChatListBuyer onSelect={handleSelect} selectedId={selectedChatId} />
      </aside>
      <main className="flex-1">
        <ChatRoomBuyer chatIdProp={selectedChatId} />
      </main>
    </div>
  );
}
