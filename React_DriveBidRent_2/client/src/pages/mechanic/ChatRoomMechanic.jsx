import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';
import { useParams } from 'react-router-dom';
import InspectionChatBubble from '../../components/inspection/InspectionChatBubble';
import InspectionMessageInput from '../../components/inspection/InspectionMessageInput';
import InspectionChatHeader from '../../components/inspection/InspectionChatHeader';

export default function ChatRoomMechanic({ chatIdProp }) {
  const { chatId: chatIdFromParam } = useParams();
  const chatId = chatIdProp || chatIdFromParam;
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [myUserId, setMyUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const initialLoadRef = useRef(true);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }, 100);
  };

  useEffect(() => {
    if (initialLoadRef.current && messages.length > 0) {
      scrollToBottom();
      initialLoadRef.current = false;
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keep scroll at bottom when user is at bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = 
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        scrollToBottom();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!chatId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    (async () => {
      try {
        const res = await axiosInstance.get(`/inspection-chat/${chatId}`);
        const data = res.data.data || res.data || {};
        const chatData = data.chat || data || null;
        
        setChat(chatData);
        const storedUser = (() => {
          try { 
            return JSON.parse(localStorage.getItem('user')); 
          } catch (e) { 
            return null; 
          }
        })();
        const userId = data.myUserId || storedUser?._id || storedUser?.id || null;
        setMyUserId(userId);
      } catch (err) {
        console.error('Error loading chat:', err);
      } finally {
        setIsLoading(false);
        initialLoadRef.current = true;
      }
    })();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    
    (async () => {
      try {
        const res = await axiosInstance.get(`/inspection-chat/${chatId}/messages`);
        const fetchedMessages = res.data.data || [];
        setMessages(fetchedMessages);
        
        // Set last fetched time for polling
        if (fetchedMessages.length > 0) {
          const lastMessage = fetchedMessages[fetchedMessages.length - 1];
          setLastFetchedAt(lastMessage.createdAt);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [chatId]);

  // Poll for messages every 3 seconds
  useEffect(() => {
    if (!chatId) return;
    
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(
          `/inspection-chat/${chatId}/messages${lastFetchedAt ? `?since=${encodeURIComponent(lastFetchedAt)}` : ''}`
        );
        const newMsgs = res.data.data || [];
        if (newMsgs.length > 0) {
          setMessages(prev => {
            // Deduplicate by message ID to prevent repeating messages
            const existingIds = new Set(prev.map(m => m._id));
            const uniqueNewMsgs = newMsgs.filter(m => !existingIds.has(m._id));
            return uniqueNewMsgs.length > 0 ? [...prev, ...uniqueNewMsgs] : prev;
          });
          const latestTime = newMsgs[newMsgs.length - 1]?.createdAt;
          if (latestTime) {
            setLastFetchedAt(latestTime);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // Set up polling
    const intervalId = setInterval(fetchMessages, 3000);
    
    return () => clearInterval(intervalId);
  }, [chatId, lastFetchedAt]);

  // Mark messages as read
  useEffect(() => {
    if (!chatId || !myUserId || messages.length === 0) return;
    
    const hasUnread = messages.some(m => !m.read && m.sender && m.sender._id !== myUserId);
    if (!hasUnread) return;

    (async () => {
      try {
        await axiosInstance.post(`/inspection-chat/${chatId}/mark-read`);
        setMessages(prev => prev.map(m => 
          (m.sender && m.sender._id !== myUserId ? { ...m, read: true } : m)
        ));
        try { 
          window.dispatchEvent(new CustomEvent('chatRead', { detail: { chatId } })); 
        } catch (e) {}
      } catch (err) {
        console.error('Mark-read failed:', err);
      }
    })();
  }, [messages, chatId, myUserId]);

  const handleSend = async (content) => {
    if (!chatId || !content.trim()) return;
    
    try {
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        content,
        sender: { _id: myUserId },
        createdAt: new Date().toISOString(),
        isSending: true
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      const res = await axiosInstance.post(`/inspection-chat/${chatId}/message`, { content });
      if (res.data?.data) {
        setMessages(prev => prev.map(m => 
          m._id === tempMessage._id ? res.data.data : m
        ));
        setLastFetchedAt(res.data.data.createdAt);
      }
    } catch (err) {
      console.error('Send message error:', err);
      setMessages(prev => prev.filter(m => m._id !== tempMessage?._id));
    }
  };

  const expired = chat && new Date() > new Date(chat.expiresAt);

  if (!chatId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#f8fafc] border-l border-gray-100 p-8 text-center" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        <div className="w-24 h-24 bg-white shadow-sm border border-gray-100 rounded-3xl flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10 text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">No Chat Selected</h3>
        <p className="text-gray-500 font-medium max-w-sm">
          Select a conversation from the sidebar to communicate with auction managers.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white border-l border-gray-100">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-bold text-sm uppercase tracking-wider">Loading conversation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <InspectionChatHeader
          carName={chat?.inspectionTask?.vehicleName || "Vehicle Inspection"}
          currentUserId={myUserId}
          chat={chat}
        />
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc]/50 relative"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center min-h-[300px]">
              <div className="text-center p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Start the Conversation</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto font-medium">
                  Send your first message to discuss the vehicle inspection details.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Started • {new Date(chat?.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {messages.map(m => {
                const isOwn = myUserId && m.sender && 
                  (String(m.sender._id) === String(myUserId) || String(m.sender.id) === String(myUserId));
                
                return (
                  <InspectionChatBubble 
                    key={m._id} 
                    message={m} 
                    isOwn={isOwn} 
                    className={isOwn ? 'ml-auto' : 'mr-auto'}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
      
      {expired ? (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto flex items-center justify-center space-x-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">This inspection chat has expired</p>
              <p className="text-xs font-medium text-gray-500">The conversation is now read-only</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-100 bg-white p-4 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <div className="max-w-4xl mx-auto">
            <InspectionMessageInput 
              onSend={handleSend} 
              disabled={expired} 
              placeholder="Type your message here..." 
              className="border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 rounded-2xl shadow-sm bg-gray-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}