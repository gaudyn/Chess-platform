const { Client } = require('pg');

// Do uzupełnienia 
function client(){
    return new Client({
        user: 'administrator',
        host: 'localhost',
        database: 'administrator',
        password: 'admin', 
        port: '5432'
    });
} 

exports.client = client;