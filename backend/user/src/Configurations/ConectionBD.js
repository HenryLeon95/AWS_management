const mysql = require('mysql');
require('dotenv').config()

const conexion = mysql.createConnection({
    host: process.env.DB_HOST,   
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATAB
})




conexion.connect(function(err){
    if(err) console.log(err);
    else console.log('BD esta conectada');
});

module.exports = conexion;


