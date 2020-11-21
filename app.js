const express = require('express');
const exphbs  = require('express-handlebars');
const favicon = require('serve-favicon');
const path = require('path');


const app = express();
const PORT = 5555;
 
app.engine('hbs', exphbs( {
    defaultLayout: 'main.hbs',
    extname: '.hbs'
}));
app.set('view engine', 'hbs');


app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/styles'));
app.use(express.static(__dirname + '/scripts'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))


 
app.get('/', function (req, res) {
    res.render('home');
});
 
app.listen(PORT, ()=> {
    console.log("Listening on port " + PORT);
});