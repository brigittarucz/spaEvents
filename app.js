const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes');
const db = require('./util/database'); // The pool itself

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

db.execute('SELECT * FROM users').then(result =>{
    console.log(result[0]);
}).catch(err => {
    console.log(err);
});

// db.end(); when we shut the app

// app.use((req,res,next) => {
//     res.send('Hello '+ dir);
// })

app.listen(3000);