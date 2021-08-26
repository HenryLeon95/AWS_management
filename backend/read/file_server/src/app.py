from flask import Flask, request, jsonify, Response
from flask_cors import CORS #, cross_origin --for specific routes.
from datetime import datetime
import creds as aws
import db_creds
import boto3
import pymysql
import json



# Settings
app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
CORS(app)
bucket = "ayd2-images"

#db config
db_config = db_creds.db_creds()
db = pymysql.connect(host=db_config.MYSQL_HOST, user=db_config.MYSQL_USER,
    password=db_config.MYSQL_PASSWORD, database=db_config.MYSQL_DB)

#S3
client = boto3.client(
    's3',
    region_name=aws.s3_creds.region_name,
    aws_access_key_id=aws.s3_creds.aws_access_key_id,
    aws_secret_access_key=aws.s3_creds.aws_secret_access_key
)



#Routes
@app.route('/')
def main():
    print("Hello World")
    return "Hello World"


@app.route('/archive/view', methods=['GET'])
def viewFile():
    request_data = request.get_json()
    idArchive = request_data['idArchive']
    status = False
    msg = "File not found"

    try:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM Archive where idArchive = %s;", (str(idArchive)))
        row_headers = [x[0] for x in cursor.description]    # We get the name of the fields
        fils = cursor.fetchall()                            # We get the values of fields
        db.commit()

        if(len(fils) < 1):
            return jsonify({'status': status, 'msg': msg}), 409

        json_data = []                                      # Array to return the data
        
        for result in fils:
            json_data.append(dict(zip(row_headers, result)))
        
        return jsonify(json_data[0])

    except:
        status = False
        return jsonify({'status': status, 'msg': msg}), 400

    
@app.route('/archive/delete', methods = ['POST'])
def deleteFile():
    request_data = request.get_json()
    idArchive = request_data['idArchive']
    aws_path = request_data['aws_path']
    status = False
    msg = "File Not Found"

    try:
        cursor = db.cursor()
        # We check if the file exists
        cursor.execute("Select * FROM Archive where idArchive = %s", (str(idArchive)))
        fils = cursor.fetchall()
        db.commit()
        # If it exists, we proceed to delete the file.
        if len(fils) >= 1:
            cursor.execute("DELETE FROM Archive where idArchive = %s", (str(idArchive)))
            db.commit()

            client.delete_object(
                Bucket=bucket,
                Key=aws_path
            )

            status = True
            msg = "Deleted File"
            return jsonify({'status': status, 'msg': msg})

    except:
        print("ERROR in the process")

    return jsonify({'status': status, 'msg': msg}), 409


@app.route('/archive/move', methods = ['POST'])
def moveFile():
    data_request = request.get_json()
    idArchive = data_request['idArchive']
    nameArchive = data_request['nameArchive']
    typeA = data_request['type']
    # nameFileOrigin = data_request['nameFileOrigin']
    # nameFileDestiny = data_request['nameFileDestiny']
    # file_path = nameFileDestiny + "/" + nameArchive + "." + typeA
    idFile = data_request['idFile']
    last_modified = datetime.now()
    status = False
    msg = "File not found"

    try:
        cursor = db.cursor()
        cursor.execute("Select * FROM Archive where idArchive = %s", (str(idArchive)))
        fils = cursor.fetchall()
        db.commit()
        
        # We check if the file exists
        if len(fils) >= 1:
            cursor.execute("SELECT * FROM Archive WHERE name = %s and type = %s and folder = %s;",
                (nameArchive, typeA, str(idFile)))
            fils = cursor.fetchall()
            db.commit()

            #We check if the is already a file with that name in the destination folder
            if len(fils) < 1:
                cursor.execute("UPDATE Archive SET folder = %s, last_modified = %s WHERE idArchive = %s;",
                    (str(idFile), last_modified, str(idArchive)))
                db.commit()
                ''' #Por si necesitamos mover el archivo físico
                cursor.execute("UPDATE Archive SET aws_path = %s, folder = %s WHERE idArchive = %s;",
                    (file_path, str(idFile), str(idArchive)))
                db.commit()

                client.copy_object(
                    Bucket = bucket,
                    CopySource = bucket + "/" + nameFileOrigin + "/" + nameArchive + "." + typeA,
                    Key = file_path
                )

                client.delete_object(
                    Bucket=bucket,
                    Key=nameFileOrigin + "/" + nameArchive + "." + typeA
                )'''

                status = True
                msg = "File moved"

                return jsonify({'status': status, 'msg': msg})

            else:
                msg = "Error, file already exists"

    except:
        msg = "Unable to move the file"
        
    return jsonify({'status': status, 'msg': msg}), 409



# good practices
## It only runs when the file is running and not when it is being imported.
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4001, debug = True)
##
#RUN ON CONSOLE
#python src/app.py
##