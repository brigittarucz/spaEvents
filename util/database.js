const mysql = require('mysql2');

// You have to set up a connection for every new query
// To avoid that we set up a connection pool

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'techevents_users',
    password: 'password'
});

module.exports = pool.promise();