# Built-in modules
import os
import traceback
import time
from subprocess import Popen
import atexit
import argparse

# Installed modules
from flask import Flask, request, redirect, send_from_directory, send_file
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
from werkzeug.utils import secure_filename
from tinydb import TinyDB as tinydb
import requests
from notebook import notebookapp
import wmi
import psutil

# create directory if does not exists
def createDirectory(directory):
  try:
    os.mkdir(directory)
  except Exception:
    print({"error": {"type": "api", "source": "main",
                     "msg": str(traceback.format_exc())}})


createDirectory("data")
createDirectory("data/Inventory")
createDirectory("data/JupyterNB")

# database
tinydbDatabase = tinydb(str(os.getcwd()) + "\\data\\db.json")

# parse command-line arguments
parser = argparse.ArgumentParser()
parser.add_argument("--debug", help="enable debug mode", action="store_true")
parser.add_argument(
    "--tunnel", help="enable tunnelling to web", action="store_true")
parser.add_argument("--node", help="run Node.js app", action="store_true")
parser.add_argument(
    "--jupyternb", help="run Jupyter Notebook app", action="store_true")
args = parser.parse_args()

# run flask app
app = Flask(__name__, static_folder='www')
CORS(app)
api = Api(app)
parser = reqparse.RequestParser()

# process manager
processManager = wmi.WMI()

# serve index.html
@app.route('/<path:path>')
def static_proxy(path):
  return send_from_directory("www", path)


# =============================================================================
# TinyDB
# =============================================================================
class TinyDB(Resource):
  def get(self):
    return list(tinydbDatabase.tables())

class TinyDB_Table(Resource):
  def get(self, table):
    table = tinydbDatabase.table(table)
    items = []
    for item in table.all():
      item["id"] = item.doc_id
      items.append(item)
    return items

  def post(self, table):
    table = tinydbDatabase.table(table)
    return table.insert(request.json)

class TinyDB_Item(Resource):
  def get(self, table, doc_id):
    table = tinydbDatabase.table(table)
    try:
      item = table.get(doc_id=int(doc_id))
      item["id"] = doc_id
      return item
    except Exception:
      return {"error": {"type": "api", "msg": "TinyDB_Item: GET\n" + str(traceback.format_exc())}}

  def delete(self, table, doc_id):
    table = tinydbDatabase.table(table)
    try:
      table.remove(doc_ids=[int(doc_id)])
      return {}
    except Exception:
      return {"error": {"type": "api", "msg": "TinyDB_Item: DEL\n" + str(traceback.format_exc())}}


api.add_resource(TinyDB, '/tinydb')
api.add_resource(TinyDB_Table, '/tinydb/<table>')
api.add_resource(TinyDB_Item, '/tinydb/<table>/<doc_id>')

# =============================================================================
# File Upload
# =============================================================================
# UPLOAD_FOLDER = 'temp'
# ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

class Upload(Resource):
  def post(self, directory):
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

# =============================================================================
# File Download
# =============================================================================
class Download(Resource):
  def get(self, directory, file):
    return send_file("data/" + directory + "/" + file)


api.add_resource(Download, '/download/<directory>/<file>')

# =============================================================================
# Startup Actions
# =============================================================================
# Jupyter Notebook app
jupyternb = None
jupyternb_server = {"token": None}
if args.jupyternb:
  try:
    jupyternb = Popen(['jupyter', 'notebook', "--config",
                       "jupyter_notebook_config.py"], shell=True)
    time.sleep(10)
    jupyternb_server = list(notebookapp.list_running_servers())[0]
    print("JupyterNB app started.")
  except Exception:
    print({"error": {"type": "api", "msg": str(traceback.format_exc())}})

# Node.js app
node = None
if args.node:
  try:
    node = Popen(['node', 'app.js'], shell=True)
    time.sleep(3)
    print("Node.js app started.")
  except Exception:
    print({"error": {"type": "api", "msg": str(traceback.format_exc())}})

# Tunneling
if args.tunnel:
  time.sleep(3)
  if node:
    table = tinydbDatabase.table("ngrok")
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
            print("Python app tunnelled through: " + r.json()["url"])
    if jupyternb:
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
            mlabr = requests.put("https://api.mlab.com/api/1/databases/hsyn/collections/ngrok/" +
                                 mlabr.json()[1]["_id"]["$oid"] + "?apiKey=Do4rql-3HdmtYmJE5oz9rHVILV5Mos9d", json=item)
            if mlabr.status_code != 200:
              print(
                  {"error": {"type": "api", "msg": "Connection to remote database mLab failed."}})
            else:
              print("JupyterNB app tunnelled through: " +
                    item["url"] + "?token=" + item["token"])


# At exit cleaning
def killProcess(proc_pid):
  process = psutil.Process(proc_pid)
  for proc in process.children(recursive=True):
    proc.kill()
  process.kill()

def cleanup():
  time.sleep(3)
  processes = ["node.exe", "node.exe",
               "jupyter-notebook.exe", "jupyter-notebook.exe"]
  if node:
    killProcess(node.pid)
    if args.debug:
      while processes.count("node.exe") > 1:
        processes = []
        for process in processManager.Win32_Process():
          processes.append(process.Name)
        time.sleep(1)
    else:
      while processes.count("node.exe") > 0:
        processes = []
        for process in processManager.Win32_Process():
          processes.append(process.Name)
        time.sleep(1)
    print('Node.js app stopped.')
  if jupyternb:
    killProcess(jupyternb.pid)
    if args.debug:
      while processes.count("jupyter.exe") > 1:
        processes = []
        for process in processManager.Win32_Process():
          processes.append(process.Name)
        time.sleep(1)
    else:
      while processes.count("jupyter.exe") > 0:
        processes = []
        for process in processManager.Win32_Process():
          processes.append(process.Name)
        time.sleep(1)
    print('JupyterNB app stopped.')


atexit.register(cleanup)

app.run(host="0.0.0.0", debug=args.debug, extra_files=["app.js"])
