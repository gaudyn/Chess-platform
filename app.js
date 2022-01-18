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
    let userData = socket.handshake.auth;
    let roomId = userData.roomId.toString();

    console.log('Gracz '+userData.username +' przyłączony do pokoju '+ roomId);
    if(!rooms[roomId]){
        rooms[roomId] = {
            whitePlayer: "",
            blackPlayer: "",
            audience: [userData.username]
        }
    } else {
        rooms[roomId].audience.push(userData.username);
    }
    
    socket.join(roomId);

    socket.on('disconnecting', (reason) => {
        for(const room of socket.rooms) {
            if(room == socket.id) continue;
            let index = rooms[room].audience.indexOf(userData.username)
            rooms[room].audience.splice(index, 1);
            socket.to(roomId).emit('fillRoom', rooms[roomId]);
        }
        console.log('Gracz '+userData.username+' został odłączony');
    });

    io.to(roomId).emit('fillRoom', rooms[roomId]);
    console.log(socket.id);

    
})


server.listen(3000);
console.log('Server started on port 3000');