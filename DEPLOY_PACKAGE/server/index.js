const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initGameState, getGameState } = require('./gameState');
const { registerSocketHandlers } = require('./socketHandlers');

const app = express();
app.use(cors());

// Serve static files from the React app
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));

const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 1e8, // 100 MB
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize Game State
initGameState();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    registerSocketHandlers(io, socket);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// Using regex to handle catch-all in Express 5
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
