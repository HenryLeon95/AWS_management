//Constant
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs');
const app = express();
const aws_keys = require('../creds/creds');
const AWS = require('aws-sdk');
const s3 = new AWS.S3(aws_keys.s3);
const bucket = "ayd2-images"
const File = require('./models/file')


//Variables
var port = process.env.PORT || 5000;
var corsOptions = {origin: true, optionsSuccessStatus: 200};


//Settings
app.use(cors(corsOptions));
app.use(bodyParser.json({limit: '100mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
app.set('port', port);
app.use(morgan('dev')); // Middlewares
// app.use(bodyParser.json());


//Routes
app.get('/', (req, res) => {
    res.status(200).json({ "msg": "Conecto" });
});

app.post('/archive/create', (req, res) =>{
    let body = req.body;
    let name_folder = body.name_file;
    let name_archive = body.name_archive;
    let type = body.type;
    let idFolder = body.id_folder;
    let date_create = new Date();

    //Decode file
    let encodedFile = body.archive;
    let decodedFile = Buffer.from(encodedFile, 'base64');
    let filename = `${name_archive}.${type}`;

    //S3 Parameters
    let bucketname = bucket;
    let filepath = `${name_folder}/${filename}`;

    const fileData = {
        idArchive: null,
        name: name_archive,
        aws_path: filepath,
        type: type,
        date_create: date_create,
        folder: idFolder
    };
    var uploadParamS3 = {
        Bucket: bucketname,
        Key: filepath,
        Body: decodedFile,
        ACL: 'public-read',
    };

    File.insertFile(fileData, (err, data) => {
        if(data && data.insertId){
            s3.upload(uploadParamS3, function sync(err, data){
                if(err){
                    console.log('Error uploading file: ', err);
                    res.status(409).json({
                        status: false,
                        msg: 'Error uploading file'
                    });
                }
                else{
                    console.log(data);
                    res.json({
                        status: true,
                        msg: 'File uploaded successfully'
                    });
                }
            });
        }
        else{
            console.log(err);
            res.json({
                status: false,
                msg: 'db failed'
            });
        }
    });
});

app.put('/archive/update', (req, res) => {
    let last_date = new Date();
    const fileData = {
        idArchive: req.body.idArchive,
        name: req.body.name_archive,
        aws_path: req.body.aws_path,
        type: req.body.type,
        date: last_date,
        idFolder: req.body.folder
    };
    console.log(fileData);

    File.updateFile(fileData, (err, data) => {
        if (data && data.msg){
            res.json({
                status: true,
                msg: 'File uploaded successfully'
            });          
            //data.rows[0].name
            
            /* Por si necesitamos renombrar el archivo del bucket
            var copyParams = {
                Bucket: bucket, 
                CopySource: `${bucket}/${fileData.aws_path}`,
                Key: data.rows[0].name + "/" + fileData.name + "." + fileData.type
            };

            s3.copyObject(copyParams, (err, data) =>{
                if(err){
                    res.status(409).json({
                        status: false,
                        msg: "Error while copying the file"
                    });
                }
                else{
                    res.json({
                        status: true,
                        msg: 'File uploaded successfully'
                    });               
                }
            });*/
        }
        else{
            res.status(409).json({
                status: false,
                msg: "File renaming error"
            });
        }
    });
});



app.listen(app.get('port'), () => {
    console.log('Server on port ' + port);
});
/*
RUN ON CONSOLE
npm start
*/