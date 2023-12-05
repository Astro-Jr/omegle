const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
  // Handle WebRTC signaling (offer, answer, ICE candidates) between clients
    socket.on('offer', (offer, receiverId) => {
        io.to(receiverId).emit('offer', offer, socket.id);
    });

    socket.on('answer', (answer, senderId) => {
        io.to(senderId).emit('answer', answer);
    });

    socket.on('ice-candidate', (candidate, targetId) => {
        io.to(targetId).emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
    // Handle disconnection
    alert("disconnected")
    });
});

server.listen(3000, () => {
    console.log('Server started on port 3000');
});
