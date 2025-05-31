const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

let messages = []; // Store messages with structure: { id, user, text, replyTo }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send existing messages to new user
  socket.emit('init', messages);

  // Handle new messages
  socket.on('message', (msg) => {
    const message = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      user: msg.user,
      text: msg.text,
      replyTo: msg.replyTo || null,
      timestamp: new Date().toISOString(),
    };
    messages.push(message);
    io.emit('message', message); // broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
