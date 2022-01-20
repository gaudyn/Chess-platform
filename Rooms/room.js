function Room(){
    /**@type {string} */
    this.whitePlayer = undefined;
    /**@type {string} */
    this.blackPlayer = undefined;
    /**@type {string[]} */
    this.audience = [];

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
}

let room = new Room();

exports.Room = Room;