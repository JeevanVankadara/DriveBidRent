import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatListMechanic from './ChatListMechanic';
import ChatRoomMechanic from './ChatRoomMechanic';

export default function ChatPageMechanic() {
  const { chatId: chatIdFromParam } = useParams();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState(chatIdFromParam || null);

  useEffect(() => { setSelectedChatId(chatIdFromParam || null); }, [chatIdFromParam]);

  const handleSelect = (id) => { setSelectedChatId(id); navigate(`/mechanic/chats/${id}`); };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      <aside className="w-80 border-r">
        <ChatListMechanic onSelect={handleSelect} selectedId={selectedChatId} />
      </aside>
      <main className="flex-1">
        <ChatRoomMechanic chatIdProp={selectedChatId} />
      </main>
    </div>
  );
}
