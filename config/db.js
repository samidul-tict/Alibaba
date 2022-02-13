const mysql = require('mysql');

//* Database connection *//

const connection = mysql.createPool({
    host : "alibabasql.ciss3afmkxid.ap-south-1.rds.amazonaws.com",
    user : "aliadmin",
    password : "vHH8oQMrUuwHmjJN", //Orginal Password jdhhfi@Hyug%^456					
    database : "alibaba",
    port : "3306",
    multipleStatements: true,
    dateStrings: true,
    connectionLimit: 1000
});

module.exports = connection;