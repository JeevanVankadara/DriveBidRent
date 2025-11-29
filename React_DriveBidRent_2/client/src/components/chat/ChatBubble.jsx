import React from 'react';

const ChatBubble = ({ message, isOwn }) => {
  const base = 'px-4 py-2 rounded-lg mb-2 break-words';

  const bubbleClass = isOwn
    ? 'bg-green-500 text-white self-end rounded-lg text-sm dark:bg-green-600'
    : 'bg-blue-600 text-white self-start rounded-lg text-sm dark:bg-blue-500';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-2`}>
      <div className={`max-w-[75%]`}> 
        <div className={`${base} ${bubbleClass}`}>
          <div className="text-sm">{message.content}</div>
          <div className="flex items-center justify-end gap-2 mt-1">
            <div className="text-xs text-white/80">{new Date(message.createdAt).toLocaleTimeString()}</div>
              {isOwn && (
                <div className="flex items-center" title={message.read ? `Read at ${new Date(message.updatedAt || message.createdAt).toLocaleString()}` : message.delivered ? 'Delivered' : 'Sent'}>
                  {/* Two check marks side-by-side to represent double ticks. Color changes on read/delivered. */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${message.read ? 'text-amber-300' : 'text-white/80'} transition-colors duration-300`}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 -ml-1 ${message.read ? 'text-amber-300' : 'text-white/80'} transition-colors duration-300`}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
