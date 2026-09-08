import { useState } from 'react';

const InspectionMessageInput = ({ onSend, disabled, placeholder = 'Type a message...' }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 hub-bg-card border-t hub-border-c">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={disabled ? 'This chat is read only' : placeholder}
        disabled={disabled}
        aria-label="Message"
        className="hub-input flex-1 !rounded-full"
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="hub-btn-solid hub-bg-primary !rounded-full !px-5 disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
};

export default InspectionMessageInput;
