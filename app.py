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
import visa

# locally installed modules
try:
  import matlab.engine as matlabEngine
except:
  pass

# parse command-line arguments
parser = argparse.ArgumentParser()
parser.add_argument(
    "--tunnel", help="enable tunnelling to web", action="store_true")
parser.add_argument("--node", help="run Node.js app", action="store_true")
parser.add_argument(
    "--jupyternb", help="run Jupyter Notebook app", action="store_true")
parser.add_argument("--matlab", help="run Matlab app", action="store_true")
args = parser.parse_args()

# create directory if does not exists
def createDirectory(directory):
  try:
    os.mkdir(directory)
  except Exception:
    print({"error": {"type": "api", "source": "main",
                     "msg": str(traceback.format_exc())}})


createDirectory("data")
createDirectory("data/TinyDB")
createDirectory("data/Inventory")
if args.jupyternb:
  createDirectory("data/JupyterNB")

# database
tinydbDatabase = tinydb(str(os.getcwd()) + "\\data\\TinyDB\\db.json")

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
if args.jupyternb:
  try:
    jupyternb = Popen(['jupyter', 'notebook', "--config",
                       "jupyter_notebook_config.py"], shell=True)
    while len(list(notebookapp.list_running_servers())) == 0:
      time.sleep(1)
    jupyternb_server = list(notebookapp.list_running_servers())[0]
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

# At exit cleaning
def killProcess(proc_pid):
  process = psutil.Process(proc_pid)
  for proc in process.children(recursive=True):
    proc.kill()
  process.kill()

def cleanup():
  time.sleep(3)
  if node != None:
    killProcess(node.pid)
    print('Node.js app stopped.')
  if jupyternb != None:
    killProcess(jupyternb.pid)
    print('JupyterNB app stopped.')
  if matlab != None:
    matlab.quit()


atexit.register(cleanup)

# =============================================================================
# VISA Library
# =============================================================================
try:
  rm = visa.ResourceManager("C:\\Windows\\System32\\visa64.dll")
except visa.LibraryError:
  print("Visa: Library error: Not found.")

instruments = {}
class VISA(Resource):
  def post(self, instr):
    try:
      instruments[instr] = rm.get_instrument(instr)
      instruments[instr].timeout = 5000
      return {"success": "VISA Library: Connected to instrument.", "instr": instruments[instr].query("*IDN?").replace("\n", " ")}
    except:
      return {"error": "Error: VISA Library: Could not be connected to instrument!"}

  def put(self, instr):
    try:
      parser.add_argument('buff')
      args = parser.parse_args()
      instruments[instr].write(args["buff"])
      return {
          "success": "VISA Library: Buffer is written to instrument.", "buff": args["buff"]
      }
    except:
      return {"error": "Error: VISA Library: Buffer could not be written to instrument."}

  def get(self, instr):
    try:
      parser.add_argument('query')
      args = parser.parse_args()
      res = instruments[instr].query(args["query"])
      return {
          "success": "VISA Library: Query fetched from instrument.", "query": args["query"], "res": res.replace("\n", "").replace("\"", "").split(",")
      }
    except:
      return {"error": "Error: VISA Library: Query could not be fetched from instrument."}

  def delete(self, instr):
    try:
      instruments[instr].close()
      del instruments[instr]
      return {"success": "VISA Library: Connection closed to instrument."}
    except:
      return {"error": "Error: VISA Library: Connection to instrument can not be closed!"}


api.add_resource(VISA, '/visa/<instr>')

# =============================================================================
# OPC
# =============================================================================
opcServers = {}

class OPC(Resource):
  def get(self):
    return matlab.opcserverinfo('localhost', nargout=1)["ServerID"]

class OPCServer(Resource):
  def post(self, server):
    opcClient = "opcClient" + server.replace(".", "")
    opcItemGroup = "opcItemGroup" + server.replace(".", "")
    matlab.eval(opcClient + " = opcda('localhost','" + server + "')", nargout=0)
    matlab.eval("connect(" + opcClient + ")", nargout=0)
    matlab.eval(opcItemGroup + " = addgroup(" + opcClient + ")", nargout=0)
    matlab.eval("opcClientStatus = " + opcClient + ".Status", nargout=0)
    opcServers[server] = {"id": server, "client": opcClient,
                          "status": matlab.workspace["opcClientStatus"], "itemGroup": opcItemGroup, "items": []}
    return matlab.workspace["opcClientStatus"]

  def get(self, server):
    matlab.eval("opcClientStatus = " +
                opcServers[server]["client"] + ".Status", nargout=0)
    opcServers[server]["status"] = matlab.workspace["opcClientStatus"]
    return opcServers[server]

class OPCItem(Resource):
  def get(self, server, item):
    isExist = False
    opcItem = ""
    for it in opcServers[server]["items"]:
      if it["name"] == item:
        isExist = True
        opcItem = it["id"]
        break
    if not isExist:
      opcItem = "opcItem" + str(len(opcServers[server]["items"]))
      matlab.eval(opcItem + " = additem(" +
                  opcServers[server]["itemGroup"] + ",'" + item + "')", nargout=0)
      opcServers[server]["items"].append({"id": opcItem, "name": item})
    quality = ""
    while "Good" not in quality:
      matlab.eval("opcReadStatus = read(" + opcItem + ")", nargout=0)
      matlab.eval("opcReadQuality = opcReadStatus.Quality", nargout=0)
      quality = matlab.workspace["opcReadQuality"]
    matlab.eval("opcReadValue = opcReadStatus.Value", nargout=0)
    return matlab.workspace["opcReadValue"]

  def put(self, server, item):
    isExist = False
    opcItem = ""
    for it in opcServers[server]["items"]:
      if it["name"] == item:
        isExist = True
        opcItem = it["id"]
        break
    if not isExist:
      opcItem = "opcItem" + str(len(opcServers[server]["items"]))
      matlab.eval(opcItem + " = additem(" +
                  opcServers[server]["itemGroup"] + ",'" + item + "')", nargout=0)
      opcServers[server]["items"].append({"id": opcItem, "name": item})
    matlab.eval("write(" + opcItem + "," +
                str(request.json["value"]) + ")", nargout=0)
    quality = ""
    while "Good" not in quality:
      matlab.eval("opcReadStatus = read(" + opcItem + ")", nargout=0)
      matlab.eval("opcReadQuality = opcReadStatus.Quality", nargout=0)
      quality = matlab.workspace["opcReadQuality"]
    matlab.eval("opcReadValue = opcReadStatus.Value", nargout=0)
    return matlab.workspace["opcReadValue"]


api.add_resource(OPC, '/opc')
api.add_resource(OPCServer, '/opc/<server>')
api.add_resource(OPCItem, '/opc/<server>/<item>')

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

  def put(self, table, doc_id):
    table = tinydbDatabase.table(table)
    try:
      table.update(request.json, doc_ids=[int(doc_id)])
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
