const { games, moves } = require('./../Database/DBConnection');

function Room(){
    /**@type {string} */
    this.whitePlayer = undefined;
    /**@type {string} */
    this.blackPlayer = undefined;
    /**@type {string[]} */
    this.audience = [];

    /**@type {boolean} */
    this.gameStarted = false;

    this.game = {
        turn: 'white',
        moves: [],
        db_id: null
    }

    /**
     * Connects user to the room.
     * @param {string} username User's username.
     */
    this.connectUser = function(username) {
        this.audience.push(username);
    }

    /**
     * Disconnects user from the room. If the user is not connected has no effect.
     * @param {string} username User's username.
     */
    this.disconnectUser = async function(username) {
        let index = this.audience.indexOf(username)
        if (index >= 0) {
            this.audience.splice(this.audience.indexOf(username), 1);
        }
        if(username == this.whitePlayer){ 
            this.whitePlayer = undefined;
            this.endGame();
        }
        if(username == this.blackPlayer){
            this.blackPlayer = undefined;
            this.endGame();
        }
    }

    /**
     * Claims the white place for the user.
     * @param {string} username User's username.
     * @warning If the user claimed the black place, claims the white place and unclaims the black place.
     * @returns {{white: string, black: string}} Object containing players' usernames. `.white` contains the white player's username, `.black` contains the black player's username.
     */
    this.claimWhitePlace = function(username) {
        if (!this.whitePlayer) {
            this.whitePlayer = username;
            if(this.blackPlayer == username) {
                this.blackPlayer = undefined;
            }
        }
        return {
            white : this.whitePlayer,
            black : this.blackPlayer
        };
    }

    /**
     * Claims the black place for the user.
     * @param {string} username User's username.
     * @warning If the user claimed the white place, claims the black place and unclaims the white place.
     * @returns {{white: string, black: string}} Object containing players' usernames. `.white` contains the white player's username, `.black` contains the black player's username.
     */
     this.claimBlackPlace = function(username) {
        if (!this.blackPlayer) {
            this.blackPlayer = username;
            if(this.whitePlayer == username) {
                this.whitePlayer = undefined;
            }
        }
        return {
            white : this.whitePlayer,
            black : this.blackPlayer
        };
    }

    /**
     * Unclaims places claimed previously by the user.
     * @param {string} username User's username.
     * @returns {{white: string, black: string, shouldEndCountdown: boolean}} Object containing players' usernames and whether countdown for players should end: `.white` contains the white player's username, `.black` contains the black player's username.
     */
    this.unclaimPlace = function(username) {
        let shouldEndCountdown = false;
        if (this.whitePlayer == username) {
            this.endGame();
            this.whitePlayer = undefined;
            shouldEndCountdown = true;
        }
        if (this.blackPlayer == username) {
            this.endGame();
            this.blackPlayer = undefined;
            shouldEndCountdown = true;
        }
        return {
            white : this.whitePlayer,
            black : this.blackPlayer,
            shouldEndCountdown
        };
    }

    /**
     * Starts a new game.
     */
    this.startGame = async function(){
        this.gameStarted = true;
        whiteConfirm = false;
        blackConfirm = false;
        this.game.turn = 'white';
        this.game.moves = [];
        this.game.db_id = await games.createNewGame(this.whitePlayer, this.blackPlayer);
    }

    /**
     * Ends the currently running game.
     */
    this.endGame = function(){
        this.gameStarted = false;
        whiteConfirm = false;
        blackConfirm = false;

        moves.finishGame(this.game.db_id);
    }

    /**
     * Checks if the game can be started.
     * @returns `true` if the game can be started, `false` otherwise.
     */
    this.canStartGame = function(){
        if(!(this.gameStarted) && this.whitePlayer && this.blackPlayer) {
            return true; 
        }
        return false;
    }

    var whiteConfirm = false;
    var blackConfirm = false;

    /**
     * Confirms start for a player.
     * @param {string} player User's username. 
     * @returns {`kick`|`start`|`wait`} `start` if the game started, `wait` if the room is still waiting for the other player, `kick` if the players have been kicked. 
     */
    this.confirmStart = function(player){
        if (player == this.whitePlayer) {
            whiteConfirm = true;
        } else if (player == this.blackPlayer) {
            blackConfirm = true;
        } else if (!player) {
            // Kick not confirmed players out from their places.
            if(!whiteConfirm) this.whitePlayer = undefined;
            if(!blackConfirm) this.blackPlayer = undefined;
            whiteConfirm = false;
            blackConfirm = false;
            return 'kick';
        }
        if(whiteConfirm && blackConfirm) {
            this.startGame();
            return 'start';
        } else {
            return 'wait';
        }
    }

    /**
     * Checks if a move by user is valid.
     * @param {string} username User's username.
     * @param {string} move Chess move.
     * @returns {boolean} `true` if the move is valid, `false` otherwise.
     */
    this.isMoveValid = function(username, move){
        if(!this.gameStarted) return false;
        if(this.blackPlayer != username && this.whitePlayer != username) return false;
        // TODO: Check in engine if the move is valid
        return true;
    }
    /**
     * Makes a move by user.
     * @param {string} username User's username.
     * @param {{from: number[], to: number[]}} move Chess move.
     * @returns {boolean} `true` if the game has ended, `false` otherwise.
     */
    this.makeMove = function(username, move) {
        // TODO: Save the move in the database
        if(!this.isMoveValid(username, move)) return false;

        const [x1, y1] = move.from;
        const [x, y] = move.to;

        moves.addMove(this.game.db_id, username, `${x1}${y1}-${x}${y}`);
        this.game.moves.push(move);

        if (move == 'end'){ 
            this.endGame();
            return true;
        }
        return false;
    }

    /**
     * Gets all the made moves in currently running game.
     * @returns Array of moves. `.white`/`.black` contains white's/black's move in the turn, 
     */
    this.getMoves = function(){
        return this.game.moves;
    }
}

exports.Room = Room;