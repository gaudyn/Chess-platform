const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

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

var rooms = [];

io.on('connection', (socket) => {
    let username = socket.handshake.auth.username;
    let roomId = socket.handshake.auth.roomId.toString();

    console.log('Gracz '+ username +' przyłączony do pokoju '+ roomId);
    if(!rooms[roomId]){
        rooms[roomId] = {
            whitePlayer: "",
            blackPlayer: "",
            audience: [username]
        }
    } else {
        rooms[roomId].audience.push(username);
    }
    
    socket.join(roomId);
    io.to(roomId).emit('fillRoom', rooms[roomId]);

    socket.on('disconnecting', (reason) => {
        for(const room of socket.rooms) {
            if(room == socket.id) continue;
            let index = rooms[room].audience.indexOf(username)
            rooms[room].audience.splice(index, 1);
            socket.to(roomId).emit('fillRoom', rooms[roomId]);
        }
        console.log('Gracz '+username+' został odłączony');
    });

    socket.on('claimPlace', (place) => {
        if(place == 'watch') {
            if(rooms[roomId].whitePlayer == username) {
                rooms[roomId].whitePlayer = undefined;
                io.to(roomId).emit('claimPlace', 'white', '');
            } else if (rooms[roomId].blackPlayer == username) {
                rooms[roomId].blackPlayer = undefined;
                io.to(roomId).emit('claimPlace', 'black', '');
            }
        } else if (place == 'white' && !rooms[roomId].whitePlayer) {
            rooms[roomId].whitePlayer = username;
            if(rooms[roomId].blackPlayer == username){ 
                rooms[roomId].blackPlayer = undefined;
                io.to(roomId).emit('claimPlace', 'black', '');
            }
            io.to(roomId).emit('claimPlace', place, username);
        } else if (place == 'black' && !rooms[roomId].blackPlayer) {
            rooms[roomId].blackPlayer = username;
            if(rooms[roomId].whitePlayer == username){ 
                rooms[roomId].whitePlayer = undefined;
                io.to(roomId).emit('claimPlace', 'white', '');
            }
            io.to(roomId).emit('claimPlace', place, username);
        }
    });
})


server.listen(3000);
console.log('Server started on port 3000');