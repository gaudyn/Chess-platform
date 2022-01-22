const { Room } = require("./room");

function RoomManager() {
    /**@type {Object.<string, Room>} */
    this.rooms = {};

    /**
     * Connects user to the room. Creates new room if it doesn't exists.
     * @param {string} username User's username.
     * @param {string} roomId Room's id.
     * @returns {Room} Room that the user connected to.
     */
    this.connectUserToRoom = function(username, roomId) {
        if (!this.rooms[roomId]) {
            this.rooms[roomId] = new Room();
        }
        this.rooms[roomId].connectUser(username);
        return this.rooms[roomId];
    }

    /**
     * Disconnects user from the rooms.
     * @param {string} username 
     * @param {string[]} roomIds 
     */
    this.disconnectUserFromRooms = function (username, roomIds) {
        for (const room of roomIds) {
            this.rooms[room].disconnectUser(username);
        }
    }

    /**
     * Claims place for the user in the room.
     * @param {string} username User's username.
     * @param {string} roomId Room's id.
     * @param {(`white`|`black`|`watch`)} place Place to be taken.
     * @throws If the place specified is not `white` nor `black` nor `watch`.
     * @returns {{white: string, black: string}} Object containing players' usernames in the room. `.white` contains the white player's username, `.black` contains the black player's username.
     */
    this.claimPlaceForUserInRoom = function (username, roomId, place) {
        if (place == 'white') {
            return this.rooms[roomId].claimWhitePlace(username);
        } else if (place == 'black') {
            return this.rooms[roomId].claimBlackPlace(username);
        } else if (place == 'watch') {
            return this.rooms[roomId].unclaimPlace(username);
        }
        throw Error('Unexpected place');
    }

    /**
     * Starts a new game in the selected room.
     * @param {string} roomId Room's id.
     */
    this.startGameInRoom = function (roomId) {
        this.rooms[roomId].startGameInRoom();
    }

    /**
     * Ends the game in the selected room.
     * @param {string} roomId Room's id.
     */
    this.finishGameInRoom = function (roomId) {
        this.rooms[roomId].finishGameInRoom();
    }

    /**
     * Checks if a new game can be started in the room.
     * @param {string} roomId Room's id.
     * @returns `true` if the game can be started, `false` otherwise.
     */
    this.canStartGameInRoom = function (roomId) {
        return this.rooms[roomId].canStartGame();
    }

    /**
     * Confirms starting a new game by the player.
     * @param {string} username User's username.
     * @param {string} roomId Room's id.
     * @returns {`kick`|`start`|`wait`} `start` if the game started, `wait` if the room is still waiting for the other player, `kick` if the players have been kicked.
     */
    this.confirmStartForRoom = function (username, roomId) {
        return this.rooms[roomId].confirmStart(username);
    }

    /**
     * Checks if a game is running in the room.
     * @param {string} roomId Room's id 
     * @returns `true` if there is a running game, `false` otherwise.
     */
    this.isGameRunningInRoom = function (roomId) {
        return this.rooms[roomId].gameStarted;
    }

    /**
     * Checks if a move by user is valid in the selected room.
     * @param {string} username User's username.
     * @param {string} roomId Room's id.
     * @param {string} move Chess move.
     * @returns {boolean} `true` if the move is valid, `false` otherwise.
     */
    this.checkMoveInRoom = function (username, roomId, move) {
        return this.rooms[roomId].isMoveValid(username, move);
    }
    /**
     * Makes a move in the selected room by user.
     * @param {string} username User's username.
     * @param {string} roomId Room's id.
     * @param {string} move Chess move.
     * @returns {boolean} `true` if the game has ended, `false` otherwise.
     */
    this.makeMoveInRoom = function (username, roomId, move) {
        return this.rooms[roomId].makeMove(username, move);
    }
}

exports.RoomManager = RoomManager;