console.log('Client connected to server!');

var whitePlayer;
var blackPlayer;
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
            audience.innerHTML = room.audience.toString();
        })

        socket.on('claimPlace', (place, player) => {
            if (place == 'white'){
                whitePlayer.innerHTML = player
            } else if (place == 'black') {
                blackPlayer.innerHTML = player
            } 
        });

        socket.on('move', (move, player) => {
            // Update gameboard with new move
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

    // Gameplay
    this.makeMove = function(move){
        this.socket.emit('move', move);
    }
}

window.addEventListener('load', (window, event) => {
    whitePlayer = document.getElementById('whitePlayer');
    blackPlayer = document.getElementById('blackPlayer');
    audience = document.getElementById('audience');
});