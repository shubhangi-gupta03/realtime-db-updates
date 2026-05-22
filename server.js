const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Client } = require('pg');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(express.static(__dirname));

const pgClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'realtime_orders',
    password: 'admin123',
    port: 5432
});

pgClient.connect()
.then(() => {
    console.log("Connected to PostgreSQL");

    pgClient.query('LISTEN orders_channel');

    console.log("Listening for DB changes...");
})
.catch(err => {
    console.log("DB ERROR:", err);
});

pgClient.on('notification', (msg) => {

    console.log("Notification received!");

    const payload = JSON.parse(msg.payload);

    console.log(payload);

    io.emit('db_update', payload);
});

io.on('connection', (socket) => {
    console.log('Client Connected');
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});