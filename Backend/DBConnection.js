const { Client } = require('pg');

const client = new Client({
    user: 'administrator',
    host: 'localhost',
    database: 'administrator',
    password: 'admin',
    port: '5432'
});

async function createAnononymousAccount(username) {
    await client.connect();
    try {
        const res = await client.query('INSERT INTO user(username) VALUES ($1)', [username]);
        await client.end();
        return res.username;
    } catch(err) {
        await client.end();
        throw Error('Username taken');
    }
}

async function registerAccount(username, password) {
    await client.connect();

    try {
        const res = await client.query('INSERT INTO user(username, password) VALUES ($1, $2)', [username, password]);

    } catch(err) {
        await client.end();
        throw Error('Could not register user');
    }
}

async function isPasswordCorrect(username, password) {
    await client.connect();

    try {
        const res = await client.query('SELECT password FROM users WHERE username = $1', [username]);
        if (res.password == password) {
            return true;
        }
    } catch {
        return false;
    }
    return false;
}
