// Backend/sockets/auction.socket.js
export default function setupAuctionSockets(io) {
  io.on('connection', (socket) => {
    console.log('A user connected to Socket.IO:', socket.id);

    // Join a specific auction room
    socket.on('join_auction', (auctionId) => {
      socket.join(auctionId);
      console.log(`Socket ${socket.id} joined auction room: ${auctionId}`);
    });

    // Leave a specific auction room
    socket.on('leave_auction', (auctionId) => {
      socket.leave(auctionId);
      console.log(`Socket ${socket.id} left auction room: ${auctionId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}
