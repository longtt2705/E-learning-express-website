const express = require('express');
const exphbs  = require('express-handlebars');
const favicon = require('serve-favicon');
const path = require('path');
require('express-async-errors');


const app = express();

app.engine('hbs', exphbs( {
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    helpers:{
      starPrint:function(value,option){//In ngoi sao cua khoa hoc dua vao so diem danh gia
        var str='';
        let index=0
        for (; index < value; index++) {
         str = str + "<span class='fa fa-star checked'> </span>";
          
        }
        
          
        
        for (; index < 5; index++) {
          str = str + "<span class='fa fa-star'> </span>";
           
         }
        
        return str + option.fn({result: ''});
      }
    }
}));
app.set('view engine', 'hbs');


app.use('/public' ,express.static(__dirname + '/public'));
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/js', express.static(__dirname + '/js'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(express.urlencoded({extended:true}));

app.use('/',require('./router/courses.js'));

 
app.use(function (req, res) {
    res.render('404', {
      layout: false
    })
  });
  
  // default error handler
  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.render('500', {
      layout: false
    })
  })

const PORT = 5555;
app.listen(PORT, ()=> {
    console.log("Listening on port " + PORT);
});
