var http = require('http');
var express = require('express');



var app = express();

app.use(express.static('./static'));

app.set('view engine', 'ejs');
app.set('views', './views');


app.get('/', function(req, res) {
    res.render('mainpage');
})

app.get('/waitroom', (req, res) => {
    res.render('waitroom');
});

var a = 5;
console.log(a.toString(10));

app.use((req,res,next) => {
    res.render('404.ejs', { url : req.url });
   });
   

http.createServer(app).listen(3000)


console.log("Starting server");