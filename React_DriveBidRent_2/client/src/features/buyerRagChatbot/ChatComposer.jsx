import { useState } from 'react';

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export default function ChatComposer({ onSend, quickReplies = [], disabled = false }) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend?.(trimmed);
    setInput('');
  };

  const handleQuickReply = (label) => {
    if (disabled) return;
    onSend?.(label);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      {quickReplies.length > 0 && (
        <div className="flex flex-wrap gap-2 px-5 pb-3">
          {quickReplies.map((label) => (
            <button
              type="button"
              key={label}
              onClick={() => handleQuickReply(label)}
              disabled={disabled}
              className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: '#fed7aa',
                color: '#9a3412',
                backgroundColor: '#fff7ed',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="border-t px-5 py-4" style={{ borderColor: '#fed7aa', backgroundColor: '#fff7ed' }}>
        <div
          className="flex flex-col gap-3 rounded-2xl border p-3"
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#fdba74',
            boxShadow: '0 12px 30px rgba(249, 115, 22, 0.12)',
          }}
        >
          <textarea
            rows={2}
            placeholder="Ask DriveBot anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="w-full resize-none bg-transparent text-sm outline-none disabled:cursor-not-allowed"
            style={{
              lineHeight: '1.5',
              color: '#111827',
              caretColor: '#f97316',
              WebkitTextFillColor: '#111827',
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-orange-700">MongoDB listings + Gemini answers</p>
            <button
              type="button"
              onClick={handleSend}
              disabled={disabled || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: '#f97316' }}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
