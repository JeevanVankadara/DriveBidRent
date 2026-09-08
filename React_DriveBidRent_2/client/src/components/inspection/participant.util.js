// client/src/components/inspection/participant.util.js
//
// Shared helpers for the inspection chat. Both the header and the list item
// need to answer "who am I talking to?", and both previously did it with a
// pile of duplicated fallbacks and console.log debugging.

// The person on the other side of this chat.
// A mechanic sees the auction manager; an auction manager sees the mechanic.
export const getOtherParticipant = (chat, currentUserId) => {
  if (!chat) return null;

  const myId = String(currentUserId || '');
  if (myId) {
    if (chat.mechanic && String(chat.mechanic._id) === myId) return chat.auctionManager;
    if (chat.auctionManager && String(chat.auctionManager._id) === myId) return chat.mechanic;
    if (chat.seller && String(chat.seller._id) === myId) return chat.mechanic;
  }

  // Identity unknown (e.g. the chat loaded before the id did) — show whoever
  // we have rather than an empty header.
  return chat.mechanic || chat.auctionManager || null;
};

export const getParticipantName = (person) => {
  if (!person) return 'Participant';
  const name = `${person.firstName || ''} ${person.lastName || ''}`.trim();
  return name || 'Participant';
};

// First letters of first and last name, e.g. "Mechanic One" -> "MO".
export const getInitials = (person) => {
  if (!person) return '?';
  const first = (person.firstName || '').trim().charAt(0);
  const last = (person.lastName || '').trim().charAt(0);
  const initials = `${first}${last}`.toUpperCase();
  return initials || '?';
};

export const getVehicleName = (chat) =>
  chat?.inspectionTask?.vehicleName || 'Vehicle inspection';
