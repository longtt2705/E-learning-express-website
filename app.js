const express = require('express');
const exphbs  = require('express-handlebars');
 
const app = express();
const PORT = 5555;
 
app.engine('hbs', exphbs( {
    defaultLayout: 'main.hbs',
    extname: '.hbs'
}));

app.set('view engine', 'hbs');
 
app.get('/', function (req, res) {
    res.render('home');
});
 
app.listen(PORT);