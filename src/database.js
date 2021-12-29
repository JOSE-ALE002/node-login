const mysql = require('mysql2');
const { database } = require("./keys");
const { promisify } = require('util');

const connection = mysql.createConnection(database);

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('Connected to database ');
});

console.log("Prueba");

connection.query = promisify(connection.query);

module.exports = connection;