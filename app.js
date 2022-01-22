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

app.get('/room/:roomId(\\d+)', (req, res) => {
    // Zezwalamy tylko na numeryczne identyfikatory pokojów.
    // Strona z jedną rozgrywką
    res.render('room.ejs', {roomId: req.params.roomId});
});

var roomManager = new RoomManager();

io.on('connection', (socket) => {
    var username = socket.handshake.auth.username;
    var roomId = socket.handshake.auth.roomId.toString();

    console.log('Gracz '+ username +' przyłączony do pokoju '+ roomId);
    var room = roomManager.connectUserToRoom(username, roomId);
    
    socket.join(roomId);
    io.to(roomId).emit('fillRoom', room);

    socket.on('disconnecting', (reason) => {
        let connectedRooms = [...socket.rooms].filter(x => x != socket.id);
        roomManager.disconnectUserFromRooms(username, connectedRooms);
        socket.to(connectedRooms).emit('removePlayer', username);
        console.log('Gracz '+username+' został odłączony');
    });

    /**@type {NodeJS.Timeout} */
    var countdown;

    socket.on('claimPlace', (place) => {
        let players = roomManager.claimPlaceForUserInRoom(username, roomId, place);

        if(username == players.white || username == players.black){
            socket.join(`${roomId}-players`);
        }

        io.to(roomId).emit('claimPlace', 'white', players.white);
        io.to(roomId).emit('claimPlace', 'black', players.black);

        if(roomManager.canStartGameInRoom(roomId)) {
            console.log(`Game in the room ${roomId} is about to start!`);
            io.to(`${roomId}-players`).emit('gameCanStart');
            // Countdown for players to start the game.
            countdown = setTimeout( () => {
                if(roomManager.isGameRunningInRoom(roomId)) return;
                console.log(`Game in the room ${roomId} is cancelled!`);
                roomManager.confirmStartForRoom(null, roomId);
                io.to(roomId).emit('fillRoom', room);
            }, 10000);
        }
    });
    socket.on('confirmStart', () => {
        if(countdown) {
            let state = roomManager.confirmStartForRoom(username, roomId);
            console.log(`Player ${username} has confimed start!`);
            if (state == 'start') {
                io.to(roomId).emit('gameStarted');
                console.log(`Game in the room ${roomId} has started!`);
                clearTimeout(countdown);
            }
        }
    });

    socket.on('makeMove', (move) => {
        if(roomManager.makeMoveInRoom(username, roomId, move)){
            // Valid move
            io.to(roomId).emit('newMove', move, username);
        } else {
            // Invalid move, kick the player!
            roomManager.claimPlaceForUserInRoom(username, roomId, 'watch');
        }
    })
})


server.listen(3000);
console.log('Server started on port 3000');