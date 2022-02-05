console.log('Client connected to server!');

function ConnectionHandler(username) {

    // Helper functions 
    this.updateWhitePlayer = function(username){}
    this.updateBlackPlayer = function(username){}
    this.turnGameboard = function(shouldTurn){}
    this.updateAudience = function([audience]){}
    this.removePlayer = function(username){}
    this.gameStateChanged = function(state){}
    this.newMoveMade = function(move){}
    this.updateMoveList = function(move) {}
    this.resetBoard = function(){}

    this.createSocket = function (){
        var socket = io("http://localhost:3000", {autoConnect: false});
        socket.auth = {username, roomId};
        socket.connect();

        socket.on('fillRoom', (room) => {
            console.log('Fill room with '+ JSON.stringify(room));
            this.updateWhitePlayer(room.whitePlayer);
            this.updateBlackPlayer(room.blackPlayer);

            console.log(room.audience);
            //Prepare audience to make the user first on the list.
            room.audience = room.audience.filter((user) => {
                return(user != username)
            });
            console.log(room.audience);
            room.audience.splice(0, 0, username);

            this.updateAudience(room.audience);
            this.resetBoard();
            if(room.game.moves){
                for(move of room.game.moves) {
                    this.newMoveMade(move);
                    this.updateMoveList(move);
                }
            }
        })

        socket.on('claimPlace', (place, player) => {
            if (place == 'white'){
                this.updateWhitePlayer(player)
            } else if (place == 'black') {
                this.updateBlackPlayer(player)
                if(player == username) this.turnGameboard(true);
                return;
            } 
            if(player == username) this.turnGameboard(false);
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
            this.resetBoard();
            this.updateMoveList(null);
            console.log('Gra rozpoczęta!');
        });

        socket.on('gameEnded', () => {
            this.gameStateChanged('waiting')
            console.log('Gra zakończona');
        });

        socket.on('newMove', (move, player) => {
            this.updateMoveList(move);
            if(username != player) this.newMoveMade(move);
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
        this.turnGameboard(false);
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