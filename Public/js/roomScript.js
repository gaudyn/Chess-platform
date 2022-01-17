console.log('Client connected to server!');

//import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
//import {io} from 'socket.io-client';
function createSocket(username) {
    var socket = io("http://localhost:3000", {autoConnect: false});
    socket.auth = {username, roomId};
    socket.connect();

    socket.on('message', (msg, user) => {
        console.log(user+": "+msg);
    });

    return socket;
}

function sayHello(socket) {
    socket.emit('message', 'Hello!');
}

