console.log('Client connected to server!');

/**@type {HTMLElement} */
var whitePlayer;

/**@type {HTMLElement} */
var blackPlayer;

/**@type {HTMLElement} */
var audience;


function ConnectionHandler(username) {

    this.updateWhitePlayer = function(username){return 0;}
    this.updateBlackPlayer = function(username){return 0;}
    this.updateAudience = function([audience]){return 0;}
    this.removePlayer = function(username){return 0;}

    this.createSocket = function (){
        var socket = io("http://localhost:3000", {autoConnect: false});
        socket.auth = {username, roomId};
        socket.connect();

        socket.on('fillRoom', (room) => {
            console.log('Fill room with '+ room.toString());
            this.updateWhitePlayer(room.whitePlayer);
            this.updateBlackPlayer(room.blackPlaye);
            this.updateAudience(room.audience);
        })

        socket.on('claimPlace', (place, player) => {
            if (place == 'white'){
                console.log('Claimed white place')
                this.updateWhitePlayer(player)
            } else if (place == 'black') {
                this.updateBlackPlayer(player)
            } 
        });

        socket.on('removePlayer', (username) => {
            this.removePlayer(username);
            /*
            let connectedUsers = audience.innerHTML.split(', ');
            let index = connectedUsers.indexOf(username);
            if (index >= 0){
                connectedUsers.splice(index, 1);
            }
            audience.innerHTML = connectedUsers.join(', ');
            */
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
    }

    this.connect = function(){
        this.socket = this.createSocket();
        console.log(this.socket);
    }
    
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
    client.connect();
});