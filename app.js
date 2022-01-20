const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { RoomManager } = require('./Rooms/roomManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', './Views');

app.use(express.static(__dirname + '/Public'));

app.get('/room/:roomId', (req, res) => {
    // Strona z jedną rozgrywką
    res.render('room.ejs', {roomId: req.params.roomId});
});

var roomManager = new RoomManager();

io.on('connection', (socket) => {
    let username = socket.handshake.auth.username;
    let roomId = socket.handshake.auth.roomId.toString();

    console.log('Gracz '+ username +' przyłączony do pokoju '+ roomId);
    let room = roomManager.connectUserToRoom(username, roomId);
    
    socket.join(roomId);
    io.to(roomId).emit('fillRoom', room);

    socket.on('disconnecting', (reason) => {
        let connectedRooms = [...socket.rooms].filter(x => x != socket.id);
        roomManager.disconnectUserFromRooms(username, connectedRooms);
        socket.to(connectedRooms).emit('removePlayer', username);
        console.log('Gracz '+username+' został odłączony');
    });

    socket.on('claimPlace', (place) => {
        let players = roomManager.claimPlaceForUserInRoom(username, roomId, place);
        io.to(roomId).emit('claimPlace', 'white', players.white);
        io.to(roomId).emit('claimPlace', 'black', players.black);
    });
})


server.listen(3000);
console.log('Server started on port 3000');