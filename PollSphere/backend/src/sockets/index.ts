import { Server, Socket } from 'socket.io';

export const initSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('⚡ New live client connected:', socket.id);

    // Clients will join a specific room for the poll they are viewing
    socket.on('join_poll_room', (pollId: string) => {
      socket.join(`poll_${pollId}`);
      console.log(`📡 Socket ${socket.id} joined room: poll_${pollId}`);
    });

    socket.on('leave_poll_room', (pollId: string) => {
      socket.leave(`poll_${pollId}`);
      console.log(`👋 Socket ${socket.id} left room: poll_${pollId}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
};
