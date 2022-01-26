console.log('Client connected to server!');

/**@type {HTMLElement} */
var whitePlayer;

/**@type {HTMLElement} */
var blackPlayer;

/**@type {HTMLElement} */
var audience;


function ConnectionHandler(username) {
    this.socket = (function (){
        var socket = io("http://localhost:3000", {autoConnect: false});
        socket.auth = {username, roomId};
        socket.connect();

        socket.on('fillRoom', (room) => {
            console.log('Fill room with '+ room.toString());
            whitePlayer.innerHTML = room.whitePlayer;
            blackPlayer.innerHTML = room.blackPlayer;
            audience.innerHTML = room.audience.join(', ');
        })

        socket.on('claimPlace', (place, player) => {
            if (place == 'white'){
                whitePlayer.innerHTML = player
            } else if (place == 'black') {
                blackPlayer.innerHTML = player
            } 
        });

        socket.on('removePlayer', (username) => {
            let connectedUsers = audience.innerHTML.split(', ');
            let index = connectedUsers.indexOf(username);
            if (index >= 0){
                connectedUsers.splice(index, 1);
            }
            audience.innerHTML = connectedUsers.join(', ');
        });

        socket.on('gameCanStart', () => {
            console.log('Zatwierdź grę '+username);
        });

        socket.on('gameStarted', () => {
            console.log('Gra rozpoczęta!');
        });

        socket.on('gameEnded', () => {
            console.log('Gra zakończona');
        });

        socket.on('newMove', (move, player) => {
            console.log(`Nowy ruch ${move} wykonany przez ${player}!`);
        });

        return socket;
    })();
    
    // Managing position in the room
    this.claimWhitePlace = function(){
        this.socket.emit('claimPlace', 'white');
    }

    this.claimBlackPlace = function(){
        this.socket.emit('claimPlace', 'black');
    }

    this.unclaimPlace = function(){
        this.socket.emit('claimPlace', 'watch');
    }

    this.confirmStart = function(){
        this.socket.emit('confirmStart');
    }

    // Gameplay
    this.makeMove = function(move){
        this.socket.emit('makeMove', move);
    }
}

window.addEventListener('load', (window, event) => {
    whitePlayer = document.getElementById('whitePlayer');
    blackPlayer = document.getElementById('blackPlayer');
    audience = document.getElementById('audience');
});