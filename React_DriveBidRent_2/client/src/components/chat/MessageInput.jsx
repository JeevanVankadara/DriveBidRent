import React, { useState } from 'react';

const MessageInput = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const txt = value.trim();
    if (!txt) return;
    onSend(txt);
    setValue('');
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2 p-2 border-t">
      <input
        className="flex-1 px-3 py-2 rounded-md border"
        placeholder={disabled ? 'Chat expired' : 'Type a message...'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled} className="px-4 py-2 bg-orange-500 text-white rounded-md">Send</button>
    </form>
  );
};

export default MessageInput;
