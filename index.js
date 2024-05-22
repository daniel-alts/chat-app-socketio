const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io')


const app = express();
// creating a server from express
const server = createServer(app);
// mount/bind http server on socket.io
const io = new Server(server);


app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

const connections = {}

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    const token = socket.handshake.auth.token
    console.log('token', token)
    
    connections[socket.id] = socket

    socket.on('disconnect', () => {
      console.log('a user disconnected', socket.id);
    });

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        socket.broadcast.emit('chat message', msg);
    })
})

app.post('/chat', (req, res) => {
    const socketId = req.query.socketId

    const message = req.body.message // what is nodejs

    // const response = CHATBOT.answerqeuestion(message)

    const socket = connections[socketId]
    socket.broadcast.emit('chat message', message) // sends to everyone on the connection pool except the sender
    socket.emit('chat message', message) // sends to only the sender
})

  
const PORT = 3000
const HOST = "127.0.0.1";
server.listen(PORT, HOST,() => {
  console.log('server running at http://localhost:3000');
});