var http = require('http');
var authorize = require('./authorize');
var express = require('express');
var cookieParser = require('cookie-parser');
var socket = require('socket.io');
var {users, games, moves} = require('./Backend/DBConnection');

var app = express();
var server = http.createServer(app)
var io = socket(server);


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("To jest nasz sekret"));
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
    // możemy rozróżniać użytkowników na tych z kontem i tych bez konta
    // (ci, którzy nie podali żadnego loginu nie są wpuszczani przez authorize)
    var userCookie = JSON.parse(req.signedCookies.cookie);
    if (userCookie.userType == 'loggedIn') {
        res.render('waitroom', { userTypeMessage : "loggedIn", usernameMessage: userCookie.username});
    } else {
        res.render('waitroom', { userTypeMessage : "noAccount", usernameMessage: userCookie.username});
    }
});

app.get('/room', authorize, (req, res) => {
    // możemy rozróżniać użytkowników na tych z kontem i tych bez konta
    // (ci, którzy nie podali żadnego loginu nie są wpuszczani przez authorize)
    var userCookie = JSON.parse(req.signedCookies.cookie);
    if (userCookie.userType == 'loggedIn') {
        res.render('room', { userTypeMessage : "loggedIn", usernameMessage: userCookie.username});
    } else {
        res.render('room', { userTypeMessage : "noAccount", usernameMessage: userCookie.username});
    }
});


//----------------------------------------

app.get('/logout', (req, res) => {
    res.cookie('cookie', '', { maxAge: -1 });
    res.redirect('/')
});


/**
 * Handles login request
 */
app.post('/login', (req, res) => {
    var loginUsername = req.body.UsernameInput;
    var loginPassword = req.body.PasswordInput;

    if (loginPassword == '123' && loginUsername != false) {
    //if (loginUsername != false && users.logIn(loginUsername, loginPassword)) { 

        var cookieValue = JSON.stringify({ 
            username: loginUsername,
            userType: 'loggedIn'
        });
        console.log(loginUsername);

        res.cookie('cookie', cookieValue, {signed: true});
        res.redirect('./waitroom');
    } else {
        res.render( 'login', { message : "Couldn't log in" } );
    }
});

/**
 * Handles register request
*/
app.post('/register', (req, res) => {
    var registerUsername = req.body.UsernameInput;
    var registerPassword = req.body.PasswordInput;
    var registerPasswordConfirmation = req.body.PasswordConfirmationInput;

    if (registerPassword == registerPasswordConfirmation &&
        registerPassword != false &&
        registerUsername != false) {
        try {
            registerAccount(registerUsername, registerPassword) 
            res.render( 'register', { message : "Account created succesfully!" } );
        }
        catch(err) {
            res.render( 'register', { message : err.message } );
        }
    } else {
        res.render( 'register', { message : "Invalid input" } );
    }
});

/**
 * Handles anonymous user request
*/
app.post('/noAccount', (req, res) => {
    var noAccUsername = req.body.UsernameInput;
   
    if (noAccUsername != false) {
        try {
            // createAnonymousAccount(noAccUsername)
            var cookieValue = JSON.stringify({ 
                username: noAccUsername,
                userType: 'noAccount'
            });
    
            res.cookie('cookie', cookieValue, {signed: true});
            var readcookie = req.signedCookies.cookie;
            console.log(readcookie);
            res.redirect( './waitroom');
        }
        catch(err) {
            res.render( 'noAccount', { message : err.message } );
        }
    } else {
        res.render( 'noAccount', { message : "Invalid Input" } );
    }
});


//----------------------------------------------------------------

app.use((req, res, next) => {
    res.render('404', { url: req.url });
});

server.listen(3000)
console.log("Starting server");