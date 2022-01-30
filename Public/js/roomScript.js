console.log('Client connected to server!');

/**@type {HTMLElement} */
var whitePlayer;

/**@type {HTMLElement} */
var blackPlayer;

/**@type {HTMLElement} */
var audience;


function ConnectionHandler(username) {

    // Helper functions 
    this.updateWhitePlayer = function(username){}
    this.updateBlackPlayer = function(username){}
    this.updateAudience = function([audience]){}
    this.removePlayer = function(username){}
    this.gameStateChanged = function(state){}
    this.newMoveMade = function(move){}

    this.createSocket = function (){
        var socket = io("http://localhost:3000", {autoConnect: false});
        socket.auth = {username, roomId};
        socket.connect();

        socket.on('fillRoom', (room) => {
            console.log('Fill room with '+ JSON.stringify(room));
            this.updateWhitePlayer(room.whitePlayer);
            this.updateBlackPlayer(room.blackPlayer);
            this.updateAudience(room.audience);
        })

        socket.on('claimPlace', (place, player) => {
            if (place == 'white'){
                this.updateWhitePlayer(player)
            } else if (place == 'black') {
                this.updateBlackPlayer(player)
            } 
        });

        socket.on('removePlayer', (username) => {
            this.removePlayer(username);
        });

        socket.on('gameCanStart', () => {
            this.gameStateChanged('countdown');
            console.log('Zatwierdź grę '+username);
        });

        socket.on('gameStarted', () => {
            this.gameStateChanged('playing');
            console.log('Gra rozpoczęta!');
        });

        socket.on('gameEnded', () => {
            this.gameStateChanged('waiting')
            console.log('Gra zakończona');
        });

        socket.on('newMove', (move, player) => {
            this.newMoveMade(move, player);
            console.log(`Nowy ruch ${move} wykonany przez ${player}!`);
        });

        return socket;
    }

    /**
     * Connect socket to server after setting helper funcitons.
     */
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