function Room(){
    /**@type {string} */
    this.whitePlayer = undefined;
    /**@type {string} */
    this.blackPlayer = undefined;
    /**@type {string[]} */
    this.audience = [];

    /**@type {boolean} */
    this.gameStarted = false;

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
    this.disconnectUser = function(username) {
        let index = this.audience.indexOf(username)
        if (index >= 0) {
            this.audience.splice(this.audience.indexOf(username), 1);
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
     * @returns {{white: string, black: string}} Object containing players' usernames. `.white` contains the white player's username, `.black` contains the black player's username.
     */
    this.unclaimPlace = function(username) {
        if (this.whitePlayer == username) {
            this.whitePlayer = undefined;
        }
        if (this.blackPlayer == username) {
            this.blackPlayer = undefined;
        }
        return {
            white : this.whitePlayer,
            black : this.blackPlayer
        };
    }

    /**
     * Starts a new game.
     */
    this.startGame = function(){
        this.gameStarted = true;
        whiteConfirm = false;
        blackConfirm = false;
        //TODO: Create a new game and save it in the database
    }

    /**
     * Ends the currently running game.
     */
    this.endGame = function(){
        this.gameStarted = false;
        //TODO: Finish the game in the database
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
            // Countdown ended. Kick not confirmed players out from their places.
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
        // Sprawdź czy ruch jest dobry
        return true;
    }
    /**
     * Makes a move by user.
     * @param {string} username User's username.
     * @param {string} move Chess move.
     * @returns {boolean} `true` if the game has ended, `false` otherwise.
     */
    this.makeMove = function (username, move) {
        // Zapisz ruch w bazie danych
        if (move == 'end') return true;
        return false;
    }
}

exports.Room = Room;