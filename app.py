# Built-in modules
import os
import traceback
import time
from subprocess import Popen
import atexit
import argparse
from datetime import datetime

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
import matlab.engine as matlabEngine

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
parser.add_argument(
    "--tunnel", help="enable tunnelling to web", action="store_true")
parser.add_argument("--node", help="run Node.js app", action="store_true")
parser.add_argument(
    "--jupyternb", help="run Jupyter Notebook app", action="store_true")
parser.add_argument("--matlab", help="run Matlab app", action="store_true")
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
# Tools
# =============================================================================
class SafeRequests:
  def get(self, url, params=None, timeout=10):
    status_code = 0
    start = datetime.now()
    now = datetime.now()
    while status_code != 200 and (now - start).seconds <= timeout:
      try:
        response = requests.get(url, params)
        status_code = response.status_code
        time.sleep(1)
      except Exception:
        print({"error": {"type": "api", "msg": str(traceback.format_exc())}})
      now = datetime.now()
    if status_code != 200:
      print({"error": {"type": "api", "msg": "Timeout reached in request"}})
      return False, None
    else:
      return True, response

safeRequest = SafeRequests()

# =============================================================================
# External Apps
# =============================================================================
# JupyterNB
jupyternb = None
jupyternb_server = {"token": None}
if args.jupyternb:
  try:
    jupyternb = Popen(['jupyter', 'notebook', "--config",
                       "jupyter_notebook_config.py"], shell=True)
    while len(list(notebookapp.list_running_servers())) == 0:
      time.sleep(1)
    jupyternb_server = list(notebookapp.list_running_servers())[0]
    table = tinydbDatabase.table("jupyternb")
    if table.get(doc_id=1):
      table.update(jupyternb_server, doc_ids=[1])
    else:
      table.insert(jupyternb_server)
    print("JupyterNB app started.")
  except Exception:
    print({"error": {"type": "api", "msg": str(traceback.format_exc())}})

# NodeJS
node = None
if args.node:
  try:
    node = Popen(['node', 'app.js'], shell=True)
  except Exception:
    print({"error": {"type": "api", "msg": str(traceback.format_exc())}})
  if not safeRequest.get("http://127.0.0.1:3000", params=None)[0]:
    print({"error": {"type": "api", "msg": "NodeJS app could not be satarted."}})
    exit()
  print("Node.js app started.")

# MATLAB 
matlab = None
if args.matlab:
  try:
    matlab = matlabEngine.start_matlab("-desktop")
    matlab.matlab.engine.shareEngine(nargout=0)
    while len(list(matlabEngine.find_matlab())) == 0:
      time.sleep(1)
    print("Matlab app started.")
  except Exception:
    print({"error": {"type": "api", "msg": str(traceback.format_exc())}})

# Ngrok
if args.tunnel:
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
            mlabr = requests.put("https://api.mlab.com/api/1/databases/hsyn/collections/ngrok/" +
                                 mlabr.json()[1]["_id"]["$oid"] + "?apiKey=Do4rql-3HdmtYmJE5oz9rHVILV5Mos9d", json=r.json())
            if mlabr.status_code != 200:
              print(
                  {"error": {"type": "api", "msg": "Connection to remote database mLab failed."}})
            else:
              print("JupyterNB app tunnelled through: " + r.json()["url"])


# At exit cleaning
def killProcess(proc_pid):
  process = psutil.Process(proc_pid)
  for proc in process.children(recursive=True):
    proc.kill()
  process.kill()

def cleanup():
  time.sleep(3)
  processes = ["node.exe", "jupyter-notebook.exe"]
  if node != None:
    killProcess(node.pid)
    while processes.count("node.exe") > 0:
      processes = []
      for process in processManager.Win32_Process():
        processes.append(process.Name)
      time.sleep(1)
    print('Node.js app stopped.')
  if jupyternb != None:
    killProcess(jupyternb.pid)
    while processes.count("jupyter.exe") > 0:
      processes = []
      for process in processManager.Win32_Process():
        processes.append(process.Name)
      time.sleep(1)
    print('JupyterNB app stopped.')
  if matlab != None:
    matlab.quit()

atexit.register(cleanup)

# =============================================================================
# TinyDB
# =============================================================================
class OPC(Resource):
  def get(self):
    return matlab.opcserverinfo('localhost',nargout=1)["ServerID"]

class OPCServer(Resource):
  def post(self, server):
    opcClient = "opcClient"+str(time.time()).replace(".", "")
    matlab.eval(opcClient +" = opcda('localhost','" + server + "')", nargout=0)
    matlab.eval("opcClientStatus = " + opcClient + ".Status", nargout=0)
    return { opcClient : matlab.workspace["opcClientStatus"]}

class OPCClient(Resource):
  def get(self, server, client):
    matlab.eval("opcClientStatus = " + client + ".Status", nargout=0)
    if matlab.workspace["opcClientStatus"] == "connected":
      serverItems = matlab.serverItems(client,"*",nargout=1)
    return { "status": matlab.workspace["opcClientStatus"], "items": serverItems} 

# class TinyDB_Table(Resource):
#   def get(self, table):
#     table = tinydbDatabase.table(table)
#     items = []
#     for item in table.all():
#       item["id"] = item.doc_id
#       items.append(item)
#     return items

#   def post(self, table):
#     table = tinydbDatabase.table(table)
#     return table.insert(request.json)

# class TinyDB_Item(Resource):
#   def get(self, table, doc_id):
#     table = tinydbDatabase.table(table)
#     try:
#       item = table.get(doc_id=int(doc_id))
#       item["id"] = doc_id
#       return item
#     except Exception:
#       return {"error": {"type": "api", "msg": "TinyDB_Item: GET\n" + str(traceback.format_exc())}}

#   def post(self, table, doc_id):
#     table = tinydbDatabase.table(table)
#     try:
#       table.update(request.json(), doc_ids=[int(doc_id)])
#       return {}
#     except Exception:
#       return {"error": {"type": "api", "msg": "TinyDB_Item: PUT\n" + str(traceback.format_exc())}}

#   def delete(self, table, doc_id):
#     table = tinydbDatabase.table(table)
#     try:
#       table.remove(doc_ids=[int(doc_id)])
#       return {}
#     except Exception:
#       return {"error": {"type": "api", "msg": "TinyDB_Item: DEL\n" + str(traceback.format_exc())}}


api.add_resource(OPC, '/opcclient')
api.add_resource(OPCServer, '/opcclient/<server>')
api.add_resource(OPCClient, '/opcclient/<server>/<client>')
# api.add_resource(TinyDB_Table, '/tinydb/<table>')
# api.add_resource(TinyDB_Item, '/tinydb/<table>/<doc_id>')

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

  def post(self, table, doc_id):
    table = tinydbDatabase.table(table)
    try:
      table.update(request.json(), doc_ids=[int(doc_id)])
      return {}
    except Exception:
      return {"error": {"type": "api", "msg": "TinyDB_Item: PUT\n" + str(traceback.format_exc())}}

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

app.run(host="0.0.0.0")













