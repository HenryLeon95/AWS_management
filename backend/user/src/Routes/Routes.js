const express = require('express');
const router  = express.Router();
const mysqlConnection = require('../Configurations/ConectionBD')
var md5 = require("md5");

router.get("/", async function (req, res) {
    const data = req.body;
    res.send('hello')

});


//############################################################ User Registration ###############################################################
// {  
//     "nickname":    "abc123",
//     "name":        "Jonathan Hidalgo",
//     "birth_date":  "1996-12-28",
//     "email":       "jon@gmail.com",
//     "password":    "1234"
// }

router.post("/User", async function (req, res) {
    const data = req.body;

    try { 
        mysqlConnection.query(`SELECT * FROM Usuario u WHERE u.nickname = '${data.nickname}' and u.password = '${data.password}'`, function (error, results, fields) {
            if (error) res.status(409).json({estado: false,data: false});

            if (results.length == 0) {

                mysqlConnection.query('INSERT INTO Usuario(nickname,name,birth_date,email,password) VALUES(?,?,?,?,?)', 
                [data.nickname, data.name, data.birth_date,data.email,data.password], function (error, results, fields) {
                    if (error) res.status(409).json({estado: false,data: false});
                    console.log("Nuevo Usuario");
                    res.status(200).json({
                        estate: true,
                        data:   true
                    });
                });
            } else {
                console.log("Usuario ya Registrado")
                res.status(409).json({
                    estate: false,
                    data:   false
                });
            }
        });
    } catch (error) {
        res.status(409).send(String(error));
    }

});

//############################################################ LOGIN USER  ###############################################################
// {   
//     "nickname":          "abc1234",
//     "password":          "1234"
// }
router.post("/Login", async function (req, res) {
    const data = req.body;
   
    query_ =  `SELECT * FROM Usuario e 
               WHERE e.nickname =   '${data.nickname}'  AND e.password = '${data.password}'`;
    try {
        mysqlConnection.query(query_, function (error, results, fields) {
            if (error) throw error;
            if (results.length == 0) {
                console.log("Trabajador No Registrado")
                res.status(409).json({ estado : false ,data:   false}); 
            } else {
                console.log('logueado')
                res.status(200).json({
                    estado: true,
                    data:   results
                }); 
            }
        });
    } catch (error) {
        res.status(409).send(String(error));
    }
});



//############################################################ ALTER USER  ###############################################################
// {  
//     "nickname":    "abc1234",
//     "name":        "Jonathan Hidalgo",
//     "birth_date":  "1996-12-28",
//     "email":       "jon@gmail.com",
//     "password":    "1234"
// }
router.post("/Update", async function (req, res) {
    const data = req.body;

    query_ =    `Update Usuario us\
                 set us.name = ?, us.birth_date =?, us.email = ?,us.password=?\
                 where us.nickname = '${data.nickname}'`;
    try {
        mysqlConnection.query(query_, 
            [data.name, data.birth_date,data.email, data.password], function (error, results, fields) {
                if (error) {console.log(error); res.status(409).json({estado: false,data: false});}
                else{
                    console.log(" Usuario Editado..");
                    res.status(200).json({
                        estado: true,
                        data:   true
                    });
                }
            });   
    } catch (error) {
        res.status(409).send(String(error));
    }

});


//############################################################ GET USER  ###############################################################
// {   
//     "nickname":          "abc1234"
// }
router.post("/GetUser", async function (req, res) {
    const data = req.body;
   
    query_ =  `SELECT * FROM Usuario e 
               WHERE e.nickname =   '${data.nickname}' `;
    try {
        mysqlConnection.query(query_, function (error, results, fields) {
            if (error) throw error;
            if (results.length == 0) {
                console.log("Error al obtener data !")
                res.status(409).json({ estado : false ,data:   false}); 
            } else {
                console.log('Data good')
                res.status(200).json({
                    estado: true,
                    data:   results
                }); 
            }
        });
    } catch (error) {
        res.status(409).send(String(error));
    }
});







module.exports = router;
