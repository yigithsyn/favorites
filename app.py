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
  def get(self, table, id):
    db = tinydb(tinydbDatabase)
    table = db.table(table)
    try:
      item = table.get(doc_id=int(id))
      item["id"] = id
      return item
    except Exception:
      return {"error": {"type": "api", "msg": "TinyDB_Item: GET\n" + str(traceback.format_exc())}}

  def delete(self, table, id):
    db = tinydb(tinydbDatabase)
    table = db.table(table)
    try:
      table.remove(doc_ids=[int(id)])
      return {}
    except Exception:
      return {"error": {"type": "api", "msg": "TinyDB_Item: DEL\n" + str(traceback.format_exc())}}


api.add_resource(TinyDB_Table, '/tinydb/<table>')
api.add_resource(TinyDB_Item, '/tinydb/<table>/<id>')
# =============================================================================
# Node.js App
# =============================================================================

node = Popen(['node', 'app.js'], shell=True)

def cleanup():
  time.sleep(1)
  node.kill()
  db = tinydb(tinydbDatabase)
  table = db.table("ngrok")
  ngrokAuth = table.get(doc_id=1)
  ngrokAuth["url"] = ""
  table.update(ngrokAuth, doc_ids=[1])
  print('Node.js app stopped.')

class Ngrok(Resource):
  def get(self):
    db = tinydb(tinydbDatabase)
    table = db.table("ngrok")
    ngrokAuth = table.get(doc_id=1)
    if ngrokAuth["url"] != "":
      return {"url": ngrokAuth["url"]}
    else:
      r = requests.post("http://127.0.0.1:3000/ngrok", data=ngrokAuth)
      if r.status_code != 200:
        return {"error": {"type": "api", "msg": "Connection to Node.js app failed."}}
      elif "error" in r.json().keys():
        return r.json()
      else:
        if "url" in r.json().keys():
          ngrokAuth["url"] = r.json()["url"]
          table.update(ngrokAuth, doc_ids=[1])
        mlab1 = requests.get("https://api.mlab.com/api/1/databases/hsyn/collections/ngrok?apiKey=Do4rql-3HdmtYmJE5oz9rHVILV5Mos9d")
        if mlab1.status_code == 200:
          item = mlab1.json()[0]
         # print(item)
          item = r.json()
          mlab2 = requests.put("https://api.mlab.com/api/1/databases/hsyn/collections/ngrok/"+mlab1.json()[0]["_id"]["$oid"]+"?apiKey=Do4rql-3HdmtYmJE5oz9rHVILV5Mos9d", json=item)
          # print(mlab2.text)
        return r.json()


atexit.register(cleanup)
api.add_resource(Ngrok, '/ngrok')
# =============================================================================
# File Upload
# =============================================================================

UPLOAD_FOLDER = 'temp'
# ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

try:
  os.mkdir(UPLOAD_FOLDER)
except OSError:
  pass

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

class Upload(Resource):
  def post(self):
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
      filename = secure_filename(file.filename)
      file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
      return {"status": 'server', "filename": filename}

  def get(self):
    return "Ok"


if __name__ == '__main__':
  app.run(debug=True, extra_files=["app.js"])
  # app.run()
