// Database connection
const mysql = require('mysql');
const db_credentials = require('../../creds/db_creds');
var connection = mysql.createPool(db_credentials);
let fileModel = {};


//Controlers
fileModel.insertFile = (fileData, callback) =>{
    if (connection){
        connection.query(
            'INSERT INTO Archive SET ?', fileData, (err, result) => {
                if(err){
                    callback(err);
                }
                else{fileData
                    callback(null, {
                        'insertId': result.insertId
                    })
                }
            }
        )
    }
};

fileModel.updateFile = (fileData, callback) => {
    if(connection){
        const sql = `
            UPDATE Archive SET
            name = ${connection.escape(fileData.name)},
            type = ${connection.escape(fileData.type)},
            last_modified = ${connection.escape(fileData.date)}
            WHERE idArchive = ${connection.escape(fileData.idArchive)}
        `;
        console.log(sql);
        
        connection.query(sql, (err, result) => {
            if(err){
                callback(null, {
                    status: false
                });
            }
            else{
                callback(null, {
                    status: true,
                    "msg": "success"
                });
                /* Por si necesitamos renombrar el archivo del bucket
                const sql2 = `
                    SELECT name FROM Folder
                    WHERE idFolder = ${connection.escape(fileData.idFolder)}
                `;
                connection.query(sql2, (err, rows) => {
                    if (err) {
                        callback(null, {
                            err: 'not exists2'
                        });
                    }
                    else{
                        callback(null, { rows, "msg": "success"});
                    }
                });
                */
            }
        });
    }
};

module.exports = fileModel;