const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {};

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
        delete users[socket.id];
        io.emit('updateUserList', getUserList());
    });

    socket.on('join', (username) => {
        users[socket.id] = username;
        io.emit('updateUserList', getUserList());
    });

    socket.on('call', (data) => {
        socket.to(data.targetId).emit('incomingCall', { caller: users[socket.id] });
    });

    socket.on('message', (data) => {
        io.emit('newMessage', { sender: data.sender, message: data.message });
    });
});

function getUserList() {
    return Object.values(users);
}

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
