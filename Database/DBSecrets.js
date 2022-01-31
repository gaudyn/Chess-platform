const { Client } = require('pg');

// Do uzupełnienia 
function client(){
    return new Client({
        user: '',
        host: 'localhost',
        database: '',
        password: '', 
        port: '5432'
    });
} 

exports.client = client;