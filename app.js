var http = require('http');
var authorize = require('./authorize');
var express = require('express');
var cookieParser = require('cookie-parser');
var socket = require('socket.io');

var app = express();
var server = http.createServer(app)
var io = socket(server);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(""))
app.use(express.static('./static'));

app.set('view engine', 'ejs');
app.set('views', './views');

//----------------------------------------

app.get('/', function (req, res) {
    res.render('mainpage');
})

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/noAccount', (req, res) => {
    res.render('noAccount');
});

app.get('/waitroom', authorize, (req, res) => {
    res.render('waitroom');
});

app.get('/room', authorize, (req, res) => {
    res.render('room');
});


//----------------------------------------


app.post('/login', (req, res) => {
    var usrNm = req.body.txtUser;
    var Pwd = req.body.txtPwd;

    //Najpierw sprawdzamy czy nazwa użytkownika jest w bazie
    if (typeof usrNm == 'string') {   // do uzupełnienia
        // Sprawdzamy czy podano poprawne hasło
        if (Pwd === '123') {     // do uzupełnienia
            res.redirect('/waitroom');
        } else {
            res.render('login', { message: "Incorrect password" });
        }
    } else {
        res.render('login', { message: "This username is not in the record!" });
    }
});

app.post('/register', (req, res) => {
    var usrNm = req.body.txtUser;
    var Pwd = req.body.txtPwd;

    // do uzupełnienia
});

app.post('/noAccount', (req, res) => {
    var usrNm = req.body.txtUser;
    // do uzupełnienia

});

//------------------------------------------------------




app.use((req, res, next) => {
    res.render('404.ejs', { url: req.url });
});


server.listen(3000)


io.on('connection', function (socket) {
    console.log('app.js says: client connected:' + socket.id);
    socket.on('newMove', function (move) {
        console.log(move);
        io.emit('newMove', data);
    })
});

console.log("Starting server");