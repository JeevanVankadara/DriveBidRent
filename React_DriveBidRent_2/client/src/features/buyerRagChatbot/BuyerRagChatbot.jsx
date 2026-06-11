import { useState } from 'react';
import ChatSidebar from './ChatSidebar';

function BotIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M9 13v2" />
      <path d="M15 13v2" />
    </svg>
  );
}

export default function BuyerRagChatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white shadow-2xl transition hover:-translate-y-0.5 hover:opacity-95 ${
          open ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        style={{
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          zIndex: 70,
          boxShadow: '0 18px 35px rgba(37, 99, 235, 0.35)',
        }}
        aria-label="Open DriveBot AI"
      >
        <BotIcon />
        DriveBot AI
      </button>
      <ChatSidebar open={open} onClose={() => setOpen(false)} />
    </>
  );
}
