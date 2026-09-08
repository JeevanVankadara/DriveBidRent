// client/src/components/inspection/InspectionChatHeader.jsx
//
// Compact chat header: initials avatar, who you are talking to, and the
// vehicle underneath. The previous version was a tall orange banner that
// tried a dozen different paths to find a car photo — the photo added
// nothing here, so it is gone.
import { getOtherParticipant, getParticipantName, getInitials, getVehicleName } from './participant.util';

const InspectionChatHeader = ({ otherUser, carName, currentUserId, chat, onDeleteChat }) => {
  const person = otherUser || getOtherParticipant(chat, currentUserId);
  const name = getParticipantName(person);
  const vehicle = carName || getVehicleName(chat);

  const expired = chat?.expiresAt && new Date() > new Date(chat.expiresAt);

  return (
    <header className="flex items-center gap-3 px-4 py-3 hub-bg-card hub-border-t border-b" style={{ borderTopWidth: 0 }}>
      <span
        aria-hidden="true"
        className="grid place-items-center h-10 w-10 rounded-full hub-bg-primary text-sm font-semibold shrink-0"
      >
        {getInitials(person)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-semibold hub-text-foreground truncate leading-tight">{name}</p>
        <p className="text-xs hub-text-muted truncate">{vehicle}</p>
      </div>

      {expired && (
        <span className="hub-eyebrow hub-text-muted hidden sm:inline whitespace-nowrap">Read only</span>
      )}

      {onDeleteChat && (
        <button
          type="button"
          onClick={() => onDeleteChat(chat?._id)}
          className="hub-btn-ghost !px-3 !py-1.5 text-xs whitespace-nowrap"
        >
          Delete chat
        </button>
      )}
    </header>
  );
};

export default InspectionChatHeader;
