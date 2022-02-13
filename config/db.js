const mysql = require('mysql');

//* Database connection *//

const connection = mysql.createPool({
    host : "abc.com",
    user : "abc",
    password : "xyz",				
    database : "test",
    port : "3306",
    multipleStatements: true,
    dateStrings: true,
    connectionLimit: 1000
});

module.exports = connection;
