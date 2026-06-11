import { useEffect, useRef, useState } from 'react';
import ChatComposer from './ChatComposer';
import ChatMessage from './ChatMessage';
import { askBuyerRagChatbot } from './buyerRagChatbot.api';

function StatusDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: '#f97316' }} />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#f97316' }} />
    </span>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const initialMessages = [
  {
    id: 1,
    sender: 'bot',
    text: 'Hi, I am DriveBot AI. Ask me for live auctions or available rentals by budget, fuel, transmission, city, seating, or condition.',
    results: []
  }
];

const initialQuickReplies = [
  'Show live auctions under 10 lakh',
  'Find automatic rentals with driver',
  'Compare cheapest options'
];

export default function ChatSidebar({ open, onClose }) {
  const [messages, setMessages] = useState(initialMessages);
  const [quickReplies, setQuickReplies] = useState(initialQuickReplies);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text) => {
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text,
      results: []
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const history = nextMessages
        .slice(-8)
        .map((message) => ({
          role: message.sender === 'bot' ? 'assistant' : 'user',
          text: message.text
        }));

      const response = await askBuyerRagChatbot({ message: text, history });

      if (!response.success) {
        throw new Error(response.message || 'DriveBot could not answer.');
      }

      const data = response.data || {};
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: data.answer || 'I searched the listings, but I could not prepare an answer.',
          results: data.results || []
        }
      ]);
      setQuickReplies(data.quickReplies?.length ? data.quickReplies : initialQuickReplies);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: error.response?.data?.message || error.message || 'DriveBot is unavailable right now. Please try again.',
          results: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 flex w-full max-w-[420px] flex-col border-l transition-transform duration-300 ease-out ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 42%, #f8fafc 100%)',
        borderColor: '#fdba74',
        boxShadow: '-18px 0 45px rgba(15, 23, 42, 0.18)',
        zIndex: 80
      }}
      aria-hidden={!open}
    >
      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{
          borderColor: '#fed7aa',
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <StatusDot />
          <span className="text-sm font-semibold text-slate-950">DriveBot AI</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-orange-100 hover:text-orange-700"
          aria-label="Close DriveBot"
        >
          <CloseIcon />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-5">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              sender={message.sender}
              text={message.text}
              results={message.results}
            />
          ))}
          {loading && (
            <ChatMessage sender="bot" text="Searching MongoDB listings and preparing an answer..." />
          )}
        </div>
      </div>

      <ChatComposer onSend={handleSend} quickReplies={quickReplies} disabled={loading} />
    </div>
  );
}
