# Built-in modules
import os
import traceback
import time
from subprocess import Popen
import atexit
# Installed modules
from flask import Flask, request, redirect, send_from_directory
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
from werkzeug.utils import secure_filename
from tinydb import TinyDB as tinydb
import requests
from notebook import notebookapp

app = Flask(__name__, static_folder='www')
CORS(app)
api = Api(app)
parser = reqparse.RequestParser()

# serve index.html
@app.route('/<path:path>')
def static_proxy(path):
  return send_from_directory("www", path)


# =============================================================================
# TinyDB
# =============================================================================

tinydbDatabase = str(os.getcwd()) + "\\data\\db.json"

class TinyDB(Resource):
  def get(self):
    db = tinydb(tinydbDatabase)
    return list(db.tables())

class TinyDB_Table(Resource):
  def get(self, table):
    db = tinydb(tinydbDatabase)
    table = db.table(table)
    items = []
    for item in table.all():
      item["id"] = item.doc_id
      items.append(item)
    return items

  def post(self, table):
    db = tinydb(tinydbDatabase)
    table = db.table(table)
    return table.insert(request.json)

class TinyDB_Item(Resource):
  def get(self, table, doc_id):
    db = tinydb(tinydbDatabase)
    table = db.table(table)
    try:
      item = table.get(doc_id=int(id))
      item["id"] = doc_id
      return item
    except Exception:
      return {"error": {"type": "api", "msg": "TinyDB_Item: GET\n" + str(traceback.format_exc())}}

  def delete(self, table, doc_id):
    db = tinydb(tinydbDatabase)
    table = db.table(table)
    try:
      table.remove(doc_ids=[int(doc_id)])
      return {}
    except Exception:
      return {"error": {"type": "api", "msg": "TinyDB_Item: DEL\n" + str(traceback.format_exc())}}


api.add_resource(TinyDB, '/tinydb')
api.add_resource(TinyDB_Table, '/tinydb/<table>')
api.add_resource(TinyDB_Item, '/tinydb/<table>/<id>')
# =============================================================================
# Node.js App
# =============================================================================


# =============================================================================
# File Upload
# =============================================================================
UPLOAD_FOLDER = 'temp'
# ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])


app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

class Upload(Resource):
  def post(self, directory):
    try:
      os.mkdir("data/" + directory)
    except OSError:
      pass
    print(request.files)
    # check if the post request has the file part
    if 'file' in request.files:
      file = request.files['file']
    elif 'upload' in request.files:
      file = request.files['upload']
    else:
      return redirect(request.url)
    # if user does not select file, browser also
    # submit a empty part without filename
    if file.filename == '':
      # flash('No selected file')
      return redirect(request.url)
    # if file and allowed_file(file.filename):
    if file:
      filename = str(time.time()).replace(".", "") + \
          "-" + secure_filename(file.filename)
      file.save(os.path.join("data/" + directory, filename))
      return filename

  def get(self):
    return "Ok"


api.add_resource(Upload, '/upload/<directory>')

# Jupyter Notebook app
jupyternb = Popen(['jupyter', 'notebook', "--config",
                   "jupyter_notebook_config.py"], shell=True)

# Node.js app
node = Popen(['node', 'app.js'], shell=True)

# Ngrok tunnelling service register
time.sleep(3)
def registerNgrokTunnel():
  db = tinydb(tinydbDatabase)
  table = db.table("ngrok")
  # Python app
  ngrokAuth = table.get(doc_id=1)
  r = requests.post("http://127.0.0.1:3000/ngrok", data=ngrokAuth)
  if r.status_code != 200:
    print({"error": {"type": "api", "msg": "Connection to Node.js app failed."}})
  elif "error" in r.json().keys():
    print(r.json())
  else:
    if "url" in r.json().keys():
      mlabr = requests.get(
          "https://api.mlab.com/api/1/databases/hsyn/collections/ngrok?apiKey=Do4rql-3HdmtYmJE5oz9rHVILV5Mos9d")
      if mlabr.status_code != 200:
        print(
            {"error": {"type": "api", "msg": "Connection to remote database mLab failed."}})
      else:
        mlabr = requests.put("https://api.mlab.com/api/1/databases/hsyn/collections/ngrok/" +
                             mlabr.json()[0]["_id"]["$oid"] + "?apiKey=Do4rql-3HdmtYmJE5oz9rHVILV5Mos9d", json=r.json())
        if mlabr.status_code != 200:
          print(
              {"error": {"type": "api", "msg": "Connection to remote database mLab failed."}})
        else:
          print(r.json())
  # Jupyter Notebook app
  ngrokAuth = table.get(doc_id=2)
  r = requests.post("http://127.0.0.1:3000/ngrok", data=ngrokAuth)
  if r.status_code != 200:
    print({"error": {"type": "api", "msg": "Connection to Node.js app failed."}})
  elif "error" in r.json().keys():
    print(r.json())
  else:
    if "url" in r.json().keys():
      mlabr = requests.get(
          "https://api.mlab.com/api/1/databases/hsyn/collections/ngrok?apiKey=Do4rql-3HdmtYmJE5oz9rHVILV5Mos9d")
      if mlabr.status_code != 200:
        print(
            {"error": {"type": "api", "msg": "Connection to remote database mLab failed."}})
      else:
        server = list(notebookapp.list_running_servers())[0]
        item = r.json()
        item["token"] = server["token"]
        print(item)
        mlabr = requests.put("https://api.mlab.com/api/1/databases/hsyn/collections/ngrok/" +
                             mlabr.json()[1]["_id"]["$oid"] + "?apiKey=Do4rql-3HdmtYmJE5oz9rHVILV5Mos9d", json=item)
        if mlabr.status_code != 200:
          print(
              {"error": {"type": "api", "msg": "Connection to remote database mLab failed."}})
        else:
          print(item)


try:
  registerNgrokTunnel()
except Exception:
  print({"error": {"type": "api", "msg": str(traceback.format_exc())}})

# At exit cleaning
def cleanup():
  time.sleep(1)
  node.kill()
  print('Node.js app stopped.')
  jupyternb.kill()
  print('Jupyter Notebook app stopped.')


atexit.register(cleanup)

# Flask app
app.run(debug=True, extra_files=["app.js"])
# app.run(debug=False)
