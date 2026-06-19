/**
 * server.js — خادم الإشارات لـ WebRTC
 * npm install express socket.io
 * node server.js
 */

const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const path    = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

// قدّم ملفات الواجهة من نفس المجلد
app.use(express.static(path.join(__dirname)));

// خريطة: socket.id → username
const users = new Map();

io.on('connection', socket => {

  // ── انضمام ──
  socket.on('join', username => {
    users.set(socket.id, username);
    console.log(`✅ انضم: ${username}`);
    broadcastUsers();
  });

  // ── رسالة نصية ──
  socket.on('chat-message', ({ to, text, timestamp }) => {
    const targetId = findSocketId(to);
    if (targetId) {
      io.to(targetId).emit('chat-message', {
        from: users.get(socket.id),
        text,
        timestamp
      });
    }
  });

  // ── WebRTC ──
  socket.on('webrtc-offer', ({ to, offer }) => {
    relay(to, 'webrtc-offer', { from: users.get(socket.id), offer });
  });

  socket.on('webrtc-answer', ({ to, answer }) => {
    relay(to, 'webrtc-answer', { from: users.get(socket.id), answer });
  });

  socket.on('webrtc-ice', ({ to, candidate }) => {
    relay(to, 'webrtc-ice', { from: users.get(socket.id), candidate });
  });

  socket.on('call-declined', ({ to }) => relay(to, 'call-declined', {}));
  socket.on('call-ended',    ({ to }) => relay(to, 'call-ended',    {}));

  // ── قطع الاتصال ──
  socket.on('disconnect', () => {
    const name = users.get(socket.id);
    users.delete(socket.id);
    console.log(`❌ غادر: ${name}`);
    io.emit('user-disconnected', name);
    broadcastUsers();
  });

  // helpers
  function relay(toUsername, event, data) {
    const id = findSocketId(toUsername);
    if (id) io.to(id).emit(event, data);
  }

  function findSocketId(username) {
    for (const [id, name] of users) {
      if (name === username) return id;
    }
    return null;
  }
});

function broadcastUsers() {
  io.emit('users', [...users.values()]);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`)
);
