// Database connection
const mysql = require('mysql');
const db_credentials = require('../../creds/db_creds');
var connection = mysql.createPool(db_credentials);
let fileModel = {};


//Controlers
fileModel.getFile = (fileData, callback) => {
    if(connection){
        connection.query(
            `SELECT * FROM Archive
            WHERE name = ${connection.escape(fileData.name)}
            AND type = ${connection.escape(fileData.type)}
            AND folder = ${connection.escape(fileData.folder)}`, (err, result) => {
                if(err){
                    callback(err);
                }
                else{
                    callback(null, result);
                }
            }
        );
    }
};

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
        
        connection.query(sql, (err, result) => {
            console.log(result.changedRows);
            if(err){
                callback(null, {
                    status: false
                });
            }
            else{
                if(result.changedRows){
                    callback(null, {
                        status: true
                    });
                }
                else{
                    callback(null, {
                        status: false
                    });
                }
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