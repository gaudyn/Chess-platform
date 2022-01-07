const { client } = require('./DBSecrets');

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

async function createAnononymousAccount(username) {
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

async function getGames() {
    const db = await getClient();
    const res = await db.query('SELECT * FROM games');
    await db.end();
    return res.rows;
}

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

async function getMoves(gameId) {
    const db = await getClient();
    const res = await db.query('SELECT * FROM moves WHERE game_id = $1', [gameId]);
    await db.end();
    return res.rows;
}

exports.users = {
    createAnonymousAccout: createAnononymousAccount,
    createAccout: registerAccount,
    logIn: isPasswordCorrect
}

exports.games = {
    createNewGame: createNewGame,
    getGames: getGames
}

exports.moves = {
    addMove: addMove,
    getMoves: getMoves
}