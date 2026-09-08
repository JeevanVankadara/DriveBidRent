// client/src/components/inspection/InspectionChatBubble.jsx
//
// One message. Own messages sit right and orange, everyone else's sit left on
// a muted surface — the usual messaging convention.
const Ticks = ({ read }) => (
  <svg viewBox="0 0 20 16" className="h-3.5 w-4" fill="none" aria-hidden="true">
    <path
      d="M1 8.5 4.5 12 11 4.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={read ? 1 : 0.85}
    />
    {read && (
      <path
        d="M8 8.5 11.5 12 18 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const InspectionChatBubble = ({ message, isOwn }) => {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words ${
          isOwn
            ? 'hub-bg-primary rounded-br-sm'
            : 'hub-bg-secondary hub-text-foreground rounded-bl-sm'
        }`}
        style={message.isSending ? { opacity: 0.7 } : undefined}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        <div
          className={`flex items-center gap-1 mt-1 text-[11px] ${
            isOwn ? 'justify-end opacity-80' : 'justify-start hub-text-muted'
          }`}
        >
          <span>{time}</span>
          {isOwn && !message.isSending && <Ticks read={message.read} />}
        </div>
      </div>
    </div>
  );
};

export default InspectionChatBubble;
