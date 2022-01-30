var http = require('http');
var authorize = require('./authorize');
var express = require('express');
var cookieParser = require('cookie-parser');
var socket = require('socket.io');
var {users, games, moves} = require('./Database/DBConnection');
const { Server } = require('socket.io');
const { RoomManager } = require('./Rooms/roomManager');

var app = express();
var server = http.createServer(app)
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', './Views');
app.use(express.static(__dirname + '/Public'));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("To jest nasz sekret"));

//----------------------------------------

app.get('/', function (req, res) {
    res.render('mainpage');
})

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/noAccount', (req, res) => {
    res.render('noAccount');
});

app.get('/waitroom', authorize, (req, res) => {
    // możemy rozróżniać użytkowników na tych z kontem i tych bez konta
    // (ci, którzy nie podali żadnego loginu nie są wpuszczani przez authorize)
    var userCookie = JSON.parse(req.signedCookies.cookie);
    if (userCookie.userType == 'loggedIn') {
        res.render('waitroom', { userTypeMessage : "loggedIn", usernameMessage: userCookie.username});
    } else {
        res.render('waitroom', { userTypeMessage : "noAccount", usernameMessage: userCookie.username});
    }
});

app.get('/room', authorize, (req, res) => {
    // możemy rozróżniać użytkowników na tych z kontem i tych bez konta
    // (ci, którzy nie podali żadnego loginu nie są wpuszczani przez authorize)
    var userCookie = JSON.parse(req.signedCookies.cookie);
    if (userCookie.userType == 'loggedIn') {
        res.render('room', { userTypeMessage : "loggedIn", usernameMessage: userCookie.username});
    } else {
        res.render('room', { userTypeMessage : "noAccount", usernameMessage: userCookie.username});
    }
});


//----------------------------------------

app.get('/logout', (req, res) => {
    res.cookie('cookie', '', { maxAge: -1 });
    res.redirect('/')
});


/**
 * Handles login request
 */
app.post('/login', async function(req, res){
    var loginUsername = req.body.UsernameInput;
    var loginPassword = req.body.PasswordInput;

    //if (loginPassword == '123' && loginUsername != false) {
    if (loginUsername != false && (await users.logIn(loginUsername, loginPassword))) {
        var cookieValue = JSON.stringify({ 
            username: loginUsername,
            userType: 'loggedIn'
        });
        res.cookie('cookie', cookieValue, {signed: true});
        res.redirect('./waitroom');
    } else {
        res.render( 'login', { message : "Couldn't log in" } );
    }
});

/**
 * Handles register request
*/
app.post('/register', async function(req, res){
    var registerUsername = req.body.UsernameInput;
    var registerPassword = req.body.PasswordInput;
    var registerPasswordConfirmation = req.body.PasswordConfirmationInput;

    if (registerPassword == registerPasswordConfirmation &&
        registerPassword != false &&
        registerUsername != false) {
        try {
            await users.createAccout(registerUsername, registerPassword);
            res.render( 'register', { message : "Account created succesfully!" } );
        }
        catch(err) {
            res.render( 'register', { message : "Username taken!" } );
        }
    } else {
        res.render( 'register', { message : "Invalid input" } );
    }
});

/**
 * Handles anonymous user request
*/
app.post('/noAccount', async function(req, res){
    var noAccUsername = req.body.UsernameInput;
   
    if (noAccUsername != false) {
        try {
            await users.createAnonymousAccount(noAccUsername)
            var cookieValue = JSON.stringify({ 
                username: noAccUsername,
                userType: 'noAccount'
            });
    
            res.cookie('cookie', cookieValue, {signed: true, maxAge: 60*60*24});
            res.redirect( './waitroom');
        }
        catch(err) {
            res.render( 'noAccount', { message : "Username taken!" } );
        }
    } else {
        res.render( 'noAccount', { message : "Invalid Input" } );
    }
});

//----------------------------------------------------------------

app.get('/room/:roomId(\\d+)', (req, res) => {
    // Enable only numeric ids for rooms
    var userCookie = JSON.parse(req.signedCookies.cookie);
    res.render('room.ejs', {roomId: req.params.roomId, username: userCookie.username});
});

app.use((req, res, next) => {
    res.render('404', { url: req.url });
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
        let connectedRooms = [...socket.rooms].filter(x => x != socket.id && x.search(/\d+-players/g)== -1);
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
        } else {
            socket.leave(`${roomId}-players`);
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
        if(roomManager.checkMoveInRoom(username, roomId, move)){
            // Valid move
            let gameEnded = roomManager.makeMoveInRoom(username, roomId, move);
            io.to(roomId).emit('newMove', move, username);
            if (gameEnded) io.to(roomId).emit('gameEnded');
        } else {
            // Invalid move, kick the player!
            roomManager.claimPlaceForUserInRoom(username, roomId, 'watch');
        }
    })
})


server.listen(3000);
console.log('Server started on port 3000');
