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

io.on('connection', (socket) => {
    let userData = socket.handshake.auth;

    console.log('Gracz przyłączony: '+ userData.username);
    socket.join(userData.roomId.toString());

    socket.on('message', (msg) => {
        console.log(userData.username+"@"+userData.roomId + ": " + msg);
        io.to(userData.roomId.toString()).emit('message', msg, userData.username);
    });
})


server.listen(3000);
console.log('Server started on port 3000');