const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes');
const db = require('./util/database'); // The pool itself
const { LocalStorage } = require('node-localstorage');
localStorage = new LocalStorage('./scratch');

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

app.use('/logout', (req,res,next) => {
    localStorage.clear();
    return res.redirect('/authenticate');
})

app.use((req,res,next) => {
    res.status(404).send('<h1>Page not found</h1>');
})

db.execute('SELECT * FROM users').then(result =>{
    console.log(result[0]);
}).catch(err => {
    console.log(err);
});

app.listen(3000);