const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const path    = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname)));

const users = new Map(); // socket.id → username

io.on('connection', socket => {

  socket.on('join', username => {
    users.set(socket.id, username);
    console.log(`✅ انضم: ${username}`);
    broadcastUsers();
  });

  socket.on('chat-message', ({ to, text, timestamp }) => {
    relay(to, 'chat-message', { from: users.get(socket.id), text, timestamp });
  });

  // WebRTC — نقل offer/answer/ice/screen بين المستخدمين
  socket.on('webrtc-offer',   ({ to, offer, mode })  => relay(to, 'webrtc-offer',   { from: users.get(socket.id), offer, mode }));
  socket.on('webrtc-answer',  ({ to, answer })        => relay(to, 'webrtc-answer',  { from: users.get(socket.id), answer }));
  socket.on('webrtc-ice',     ({ to, candidate })     => relay(to, 'webrtc-ice',     { from: users.get(socket.id), candidate }));
  socket.on('call-declined',  ({ to })                => relay(to, 'call-declined',  {}));
  socket.on('call-ended',     ({ to })                => relay(to, 'call-ended',     {}));

  socket.on('disconnect', () => {
    const name = users.get(socket.id);
    users.delete(socket.id);
    console.log(`❌ غادر: ${name}`);
    io.emit('user-disconnected', name);
    broadcastUsers();
  });

  function relay(toUsername, event, data) {
    for (const [id, name] of users) {
      if (name === toUsername) { io.to(id).emit(event, data); break; }
    }
  }
});

function broadcastUsers() {
  io.emit('users', [...users.values()]);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`));
