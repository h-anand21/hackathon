import dotenv from 'dotenv';
import { connectDB } from './config/db';
import app from './app';
import http from 'http';
import { Server } from 'socket.io';
import { initSocket } from './sockets';

dotenv.config();

const port = process.env.PORT || 5000;

// Create raw HTTP server to attach Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for Hackathon
    methods: ['GET', 'POST']
  }
});

// Pass the io instance to our socket handler
initSocket(io);

// Pass io to Express app so controllers (like response.controller) can broadcast events!
app.set('io', io);

connectDB().then(() => {
  server.listen(port, () => {
    console.log(`Server is running on port ${port} with WebSockets enabled`);
  });
});
