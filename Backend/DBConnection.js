const { client } = require('./DBSecrets');

/**
 * Creates a database client and connects it to the database
 * @returns connected client
 */
async function getClient(){
    const db = client();
    try {
        await db.connect();
        console.log('Connected to DB!');
        return db;
    } catch(e) {
        console.log('Could not connect to db: '+ err);
    }
}
/**
 * Creates an anonymous account.
 * @param {String} username - account's username 
 * @throws The username is taken, so the account could not be registered.
 */
async function createAnonymousAccount(username) {
    const db = await getClient();
    try {
        const res = await db.query('INSERT INTO users(username) VALUES ($1)', [username]);
        console.log(res.rows);
        await db.end();
    } catch(err) {
        await db.end();
        throw Error('Username taken');
    }
}
/**
 * Registers a user.
 * @param {String} username - account's username 
 * @param {String} password - account's password, hashed with SHA-512
 * @throws The username is taken, so the account could not be registered.
 */
async function registerAccount(username, password) {
    const db = await getClient();
    try {
        const res = await db.query('INSERT INTO users(username, password) VALUES ($1, $2)', [username, password]);
        await db.end();
    } catch(err) {
        await db.end();
        throw Error('Could not register user: ' + err);
    }
}
/**
 * Checks is the user's password is valid.
 * @param {String} username - account's username
 * @param {String} password - account's password, hashed with SHA-512
 * @returns `true` if the password is correct, `false` otherwise
 */
async function isPasswordCorrect(username, password) {
    const db = await getClient();
    try {
        const res = await db.query('SELECT password=$2 as is_correct FROM users WHERE username = $1', [username, password]);
        await db.end;
        if (res.rows[0].is_correct) {
            return true;
        }
    } catch(err) {
        await db.end;
        return false;
    }
    return false;
}
/**
 * Gets player id
 * @param {String} username - account's username
 */
async function getPlayerId(username) {
    const db = await getClient();
    try {
        const player_id = (await db.query('SELECT user_id FROM users WHERE username=$1', [username])).rows[0].user_id;
        await db.end();
        return player_id;
    } catch {
        await db.end();
        throw Error(`User ${username} does not exist`);
    }
}
/**
 * Creates a new game with selected players and options.
 * @param {string} white_player - White player's username
 * @param {string} black_player - Black player's username
 * @param {string} options - Game options
 */
async function createNewGame(white_player, black_player, options) {
    const db = await getClient();
    try {
        const white_player_id = await getPlayerId(white_player);
        const black_player_id = await getPlayerId(black_player);
        const res = await db.query('INSERT INTO games(wh_player, bl_player, options) VALUES ($1, $2, $3)', [white_player_id, black_player_id, options]);
        await db.end();
    } catch (err) {
        await db.end();
        throw Error('Could not create a new game ' + err);
    }
}
/**
 * Gets all games.
 * @returns Array of all games
 */
async function getGames() {
    const db = await getClient();
    const res = await db.query('SELECT * FROM games');
    await db.end();
    return res.rows;
}
/**
 * Adds a move to the game.
 * @param {number} game_id - Game's id
 * @param {string} player - Player's username
 * @param {string} move - Player's move
 */
async function addMove(game_id, player, move) {
    const db = await getClient();
    try {
        const player_id = await getPlayerId(player);
        const player_color = (await db.query('SELECT wh_player = $2 as is_white, bl_player = $2 as is_black FROM games WHERE game_id = $1', [game_id, player_id])).rows[0];
        if (player_color.is_white) {
            await db.query('INSERT INTO moves(game_id, wh_move) VALUES($1, $2)', [game_id, move]);
        } else if (player_color.is_black) {
            await db.query('INSERT INTO moves(game_id, bl_move) VALUES ($1,$2)', [game_id, move]);
        } else {
            throw Error('Invalid player');
        }
        await db.end();
    } catch(err) {
        await db.end();
        throw Error('Could not add move: ' + err);
    }
}
/**
 * Returns all moves in the game.
 * @param {number} gameId - Game's id
 * @returns Array of all the moves in the game
 */
async function getMoves(gameId) {
    const db = await getClient();
    const res = await db.query('SELECT * FROM moves WHERE game_id = $1', [gameId]);
    await db.end();
    return res.rows;
}
/**
 * Finishes the game - new moves cannot be added.
 * @param {number} gameId - Game's id
 */
async function finishGame(gameId) {
    const db = await getClient();
    await db.query('UPDATE games SET is_running = false WHERE game_id = $1', [gameId]);
    await db.end();
}

exports.users = {
    createAnonymousAccount: createAnonymousAccount,
    createAccout: registerAccount,
    logIn: isPasswordCorrect
}

exports.games = {
    createNewGame: createNewGame,
    getGames: getGames
}

exports.moves = {
    addMove: addMove,
    getMoves: getMoves,
    finishGame: finishGame
}