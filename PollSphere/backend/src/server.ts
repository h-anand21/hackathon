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

import mongoose from 'mongoose';

connectDB().then(async () => {
  // 🚨 DROP THE PROBLEMATIC INDEX THAT BLOCKS ANONYMOUS VOTERS 🚨
  try {
    await mongoose.connection.collection('responses').dropIndex('pollId_1_voterId_1');
    console.log("Dropped old unique index on pollId and voterId.");
  } catch (e) {
    // Ignore error if index doesn't exist
  }
  server.listen(port, () => {
    console.log(`Server is running on port ${port} with WebSockets enabled`);
  });
});
