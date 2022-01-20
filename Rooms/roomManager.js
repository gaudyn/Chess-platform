const { Room } = require("./room");

function RoomManager() {
    /**@type {Object.<string, Room>} */
    this.rooms = {};

    /**
     * Connects user to the room. Creates new room if it doesn't exists.
     * @param {string} username User's username
     * @param {string} roomId Room's id
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
}

exports.RoomManager = RoomManager;