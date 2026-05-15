import { Server, Socket } from 'socket.io';

export const initSocket = (io: Server) => {
  const emitRoomCount = (pollId: string) => {
    const roomName = `poll_${pollId}`;
    const count = io.sockets.adapter.rooms.get(roomName)?.size || 0;
    io.to(roomName).emit('room_count_update', { count });
  };

  io.on('connection', (socket: Socket) => {
    console.log('⚡ New live client connected:', socket.id);

    // Clients will join a specific room for the poll they are viewing
    socket.on('join_poll_room', (pollId: string) => {
      socket.join(`poll_${pollId}`);
      console.log(`📡 Socket ${socket.id} joined room: poll_${pollId}`);
      emitRoomCount(pollId);
    });

    socket.on('leave_poll_room', (pollId: string) => {
      socket.leave(`poll_${pollId}`);
      console.log(`👋 Socket ${socket.id} left room: poll_${pollId}`);
      emitRoomCount(pollId);
    });

    socket.on('disconnecting', () => {
      // Find all rooms this socket was in and update their counts
      socket.rooms.forEach(room => {
        if (room.startsWith('poll_')) {
          const pollId = room.split('_')[1];
          // We need to emit after the socket actually leaves, but since it's disconnecting,
          // the size will naturally decrease in the next tick or we can subtract 1.
          // Better yet, use a small delay or calculate carefully.
          setTimeout(() => emitRoomCount(pollId), 100);
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
};

