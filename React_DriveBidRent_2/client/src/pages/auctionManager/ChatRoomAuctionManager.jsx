import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';
import { useParams } from 'react-router-dom';
import InspectionChatBubble from '../../components/inspection/InspectionChatBubble';
import InspectionMessageInput from '../../components/inspection/InspectionMessageInput';
import InspectionChatHeader from '../../components/inspection/InspectionChatHeader';

export default function ChatRoomAuctionManager({ chatIdProp }) {
  const { chatId: chatIdFromParam } = useParams();
  const chatId = chatIdProp || chatIdFromParam;
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [myUserId, setMyUserId] = useState(null);

  const messagesRef = useRef();
  const scrollContainerRef = useRef(null);
  const initialLoadRef = useRef(true);
  const isSendingRef = useRef(false);
  const isSwitchingChatRef = useRef(false);

  // Auto-scroll behavior
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const shouldAutoScroll = () => {
      const threshold = 150;
      return el.scrollHeight - (el.scrollTop + el.clientHeight) < threshold;
    };

    if (initialLoadRef.current) {
      messagesRef.current?.scrollIntoView({ behavior: 'smooth' });
      initialLoadRef.current = false;
      return;
    }

    if (isSendingRef.current || isSwitchingChatRef.current) return;

    if (shouldAutoScroll()) {
      messagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;
    isSwitchingChatRef.current = true;
    (async () => {
      try {
        const res = await axiosInstance.get(`/inspection-chat/${chatId}`);
        console.log('=== DETAILED API RESPONSE DEBUG ===');
        console.log('Full API Response:', JSON.stringify(res.data, null, 2));
        
        const data = res.data.data || res.data || {};
        const chatData = data.chat || data || null;
        
        console.log('=== CHAT DATA STRUCTURE ===');
        console.log('chatData:', JSON.stringify(chatData, null, 2));
        
        if (chatData) {
          console.log('=== IMAGE PATHS DEBUG ===');
          console.log('inspectionTask:', chatData.inspectionTask);
          console.log('vehicleImage:', chatData.inspectionTask?.vehicleImage);
          console.log('carImage:', chatData.inspectionTask?.carImage);
          console.log('image:', chatData.inspectionTask?.image);
          console.log('Any other image fields:', Object.keys(chatData.inspectionTask || {}).filter(key => key.toLowerCase().includes('image')));
          
          console.log('=== USER DATA DEBUG ===');
          console.log('mechanic:', chatData.mechanic);
          console.log('auctionManager:', chatData.auctionManager);
          console.log('manager:', chatData.manager);
        }
        
        setChat(chatData);
        // prefer API-provided myUserId, but fall back to stored local user
        const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; } })();
        const userId = data.myUserId || storedUser?._id || storedUser?.id || null;
        console.log('=== USER ID DEBUG ===');
        console.log('myUserId from API:', data.myUserId);
        console.log('storedUser:', storedUser);
        console.log('Final userId:', userId);
        setMyUserId(userId);
      } catch (err) {
        console.error('Error loading chat:', err);
      } finally {
        isSwitchingChatRef.current = false;
      }
    })();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    (async () => {
      try {
        const res = await axiosInstance.get(`/inspection-chat/${chatId}/messages`);
        setMessages(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [chatId]);

  // mark messages as read when present and not authored by me
  useEffect(() => {
    if (!chatId || !myUserId) return;
    const hasUnread = messages.some(m => !m.read && m.sender && m.sender._id !== myUserId);
    if (!hasUnread) return;

    (async () => {
      try {
        const res = await axiosInstance.post(`/inspection-chat/${chatId}/mark-read`);
        const updated = res.data?.updated || 0;
        setMessages(prev => prev.map(m => (m.sender && m.sender._id !== myUserId ? { ...m, read: true } : m)));
        try { window.dispatchEvent(new CustomEvent('chatRead', { detail: { chatId, updated } })); } catch (e) {}
      } catch (err) {
        console.error('mark-read failed', err);
      }
    })();
  }, [messages, chatId, myUserId]);

  // Poll for messages every 3 seconds (no realtime)
  useEffect(() => {
    if (!chatId) return;
    let mounted = true;
    const fetchInitial = async () => {
      try {
        const res = await axiosInstance.get(`/inspection-chat/${chatId}/messages`);
        if (!mounted) return;
        const msgs = res.data.data || [];
        setMessages(msgs);
        if (msgs.length) {
          const latestMs = msgs.reduce((acc, m) => Math.max(acc, new Date(m.updatedAt || m.createdAt).getTime()), 0);
          setLastFetchedAt(new Date(latestMs).toISOString());
        } else setLastFetchedAt(new Date().toISOString());
      } catch (err) {
        console.error(err);
      }
    };

    fetchInitial();

    const id = setInterval(async () => {
      try {
        if (!lastFetchedAt) return;
        const res = await axiosInstance.get(`/inspection-chat/${chatId}/messages?since=${encodeURIComponent(lastFetchedAt)}`);
        const newMsgs = res.data.data || [];
        if (newMsgs.length) {
          setMessages(prev => [...prev, ...newMsgs]);
          const latestMs = newMsgs.reduce((acc, m) => Math.max(acc, new Date(m.updatedAt || m.createdAt).getTime()), 0);
          setLastFetchedAt(new Date(latestMs).toISOString());
        }
      } catch (err) { console.error(err); }
    }, 3000);

    return () => { mounted = false; clearInterval(id); };
  }, [chatId, lastFetchedAt]);

  const handleSend = async (content) => {
    if (!chatId) return;
    try {
      isSendingRef.current = true;
      const res = await axiosInstance.post(`/inspection-chat/${chatId}/message`, { content });
      if (res.data?.data) {
        setMessages(prev => [...prev, res.data.data]);
        setLastFetchedAt(res.data.data.createdAt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => { isSendingRef.current = false; }, 200);
    }
  };

  const expired = chat && new Date() > new Date(chat.expiresAt);

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50 text-lg">
        Select a mechanic to view messages
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <InspectionChatHeader
        carName={chat?.inspectionTask?.vehicleName || "Vehicle Inspection"}
        currentUserId={myUserId}
        chat={chat}
      />
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto py-4 bg-gray-50">
        {messages.map(m => {
          const isOwn = myUserId && m.sender && (String(m.sender._id) === String(myUserId) || String(m.sender.id) === String(myUserId));
          console.log('AuctionManager Message alignment - messageId:', m._id, 'senderId:', m.sender?._id, 'myUserId:', myUserId, 'isOwn:', isOwn);
          return (
            <InspectionChatBubble key={m._id} message={m} isOwn={isOwn} />
          );
        })}
        <div ref={messagesRef} />
      </div>
      {expired ? (
        <div className="p-4 text-center text-sm text-gray-600 bg-yellow-50 border-t border-yellow-200">
          This inspection chat has expired and is read-only
        </div>
      ) : (
        <InspectionMessageInput onSend={handleSend} disabled={expired} placeholder="Type a message..." />
      )}
    </div>
  );
}