const { Client } = require('pg');

// Do uzupełnienia 
function client(){
    return new Client({
        user: 'dawid2',
        host: 'localhost',
        database: 'szachy',
        password: '1234', 
        port: '5432'
    });
} 

exports.client = client;