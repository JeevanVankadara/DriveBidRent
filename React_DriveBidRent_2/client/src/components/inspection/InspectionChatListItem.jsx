// client/src/components/inspection/InspectionChatListItem.jsx
//
// One row in the inspection chat list: initials, who it is with, the vehicle,
// and the last message. The car thumbnail was dropped — it was the same photo
// on every row and often failed to load.
import { getOtherParticipant, getParticipantName, getInitials, getVehicleName } from './participant.util';

const formatWhen = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const InspectionChatListItem = ({ chat, onClick, isSelected, currentUserId }) => {
  const person = getOtherParticipant(chat, currentUserId);
  const unread = chat?.unreadCount || 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isSelected ? 'true' : undefined}
      className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors border-l-2 ${
        isSelected
          ? 'hub-bg-secondary-50 hub-border-c'
          : 'border-transparent hover:hub-bg-secondary-50'
      }`}
      style={isSelected ? { borderLeftColor: 'var(--primary)' } : undefined}
    >
      <span
        aria-hidden="true"
        className="grid place-items-center h-10 w-10 rounded-full hub-bg-primary-soft text-sm font-semibold shrink-0"
      >
        {getInitials(person)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="font-semibold hub-text-foreground truncate">
            {getParticipantName(person)}
          </span>
          <span className="text-[11px] hub-text-muted shrink-0">
            {formatWhen(chat?.lastMessageAt || chat?.createdAt)}
          </span>
        </span>

        <span className="block text-xs hub-text-muted truncate">{getVehicleName(chat)}</span>

        {chat?.lastMessage && (
          <span className="block text-xs hub-text-muted truncate mt-0.5 opacity-80">
            {chat.lastMessage}
          </span>
        )}
      </span>

      {unread > 0 && <span className="hub-nav-badge shrink-0">{unread}</span>}
    </button>
  );
};

export default InspectionChatListItem;
