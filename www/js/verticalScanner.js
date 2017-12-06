var verticalScanner = {
  simulation: false,
  Lx: 4000,
  Ly: 2000,
  x0: 2000,
  y0: 1000,
  connect: function (callback = function () { }) {
    webix.ajax().post(REST.url + "/opc/OPC.IwSCP.1", {
      error: function (t, d, x) {
        if (!verticalScanner.simulation) {
          webix.confirm({
            title: "Benzetim modu",
            ok: "Evet",
            cancel: "Hayır",
            text: "Bağlantı kurulamadı. Benzetim modunda devam edilsin mi?",
            callback: function (result) {
              verticalScanner.simulation = result
              if (result) callback("connected")
              else callback({ error: { type: "server", source: "verticalScanner.connect", msg: d.json() } })
            }
          });
        }
        else {
          callback("connected")
        }
      },
      success: function (t, d, x) {
        if (!verticalScanner.simulation) {
          if (d.json() != "connected") {
            webix.confirm({
              title: "Benzetim modu",
              ok: "Evet",
              cancel: "Hayır",
              text: "Bağlantı kurulamadı. Benzetim modunda devam edilsin mi?",
              callback: function (result) {
                verticalScanner.simulation = result
                if (result) callback("connected")
                else callback(d.json())
              }
            });
          }
          else {
            callback(d.json())
          }
        }
        else {
          callback("connected")
        }
      }
    })
  },
  getPosition: function (axis, callback = function () { }) {
    axis = (axis == "y") ? "z" : axis
    webix.ajax().get(REST.url + "/opc/OPC.IwSCP.1/!I4,HCS02.1,Plc.PVL,." + axis + "_akt_enc", {
      error: function (t, d, x) {
        if (!verticalScanner.simulation) {
          callback({ error: { type: "server", source: "verticalScanner.getPosition", msg: d.json() } })
        }
        else {
          webix.message("Benzetim modu")
          callback(0)
        }
      },
      success: function (t, d, x) {
        if (!verticalScanner.simulation) {
          callback(parseInt((parseInt(d.json()) / 1000 + 1) / 10))
        }
        else {
          webix.message("Benzetim modu")
          callback(0)
        }
      }
    })
  },
  getSpeed: function (axis, callback = function () { }) {
    axis = (axis == "y") ? "z" : axis
    webix.ajax().get(REST.url + "/opc/OPC.IwSCP.1/!I4,HCS02.1,Plc.PVL,." + axis + "_pos_hizi", {
      error: function (t, d, x) {
        if (!verticalScanner.simulation) {
          callback({ error: { type: "server", source: "verticalScanner.getSpeed", msg: d.json() } })
        }
        else {
          webix.message("Benzetim modu")
          callback(10)
        }
      },
      success: function (t, d, x) {
        if (!verticalScanner.simulation) {
          callback(parseInt(d.json() / 1000))
        }
        else {
          webix.message("Benzetim modu")
          callback(10)
        }
      }
    })
  },
  setSpeed: function (axis, value, callback = function () { }) {
    axis = (axis == "y") ? "z" : axis
    webix.ajax().headers({
      "Content-type": "application/json"
    }).put(REST.url + "/opc/OPC.IwSCP.1/!I4,HCS02.1,Plc.PVL,." + axis + "_pos_hizi", { value: parseInt(value)*1000 }, {
      error: function (t, d, x) {
        if (!verticalScanner.simulation) {
          callback({ error: { type: "server", source: "verticalScanner.setSpeed", msg: d.json() } })
        }
        else {
          webix.message("Benzetim modu")
          callback()
        }
      },
      success: function (t, d, x) {
        if (!verticalScanner.simulation) {
          callback(parseInt(d.json() / 1000))
        }
        else {
          webix.message("Benzetim modu")
          callback()
        }
      }
    })
  },
  move: function (axis, type, target, posUpdate = function () { }, callback = function () { }) {
    axis = (axis == "y") ? "z" : axis
    var currPos = 0
    var stopTarget = 0
    verticalScanner.getPosition(axis, function (value) {
      currPos = value
      stopTarget = (type == "abs") ? parseInt(target) : currPos + parseInt(target)
    })
    async.series([
      function (callback) {
        webix.ajax().headers({
          "Content-type": "application/json"
        }).put(REST.url + "/opc/OPC.IwSCP.1/!BOOL,HCS02.1,Plc.PVL,.m_" + axis + "_" + type + "_posa_git_op", { value: "false" }, {
          error: function (t, d, x) {
            if (!verticalScanner.simulation) {
              callback({ error: { type: "server", source: "verticalScanner.move", msg: d.json() } })
            }
            else {
              webix.message("Benzetim modu")
              callback()
            }
          },
          success: function (t, d, x) {
            if (!verticalScanner.simulation) {
              if (d.json().error) callback(d.json())
              else callback()
            }
            else {
              webix.message("Benzetim modu")
              callback()
            }
          }
        })
      },
      function (callback) {
        webix.ajax().headers({
          "Content-type": "application/json"
        }).put(REST.url + "/opc/OPC.IwSCP.1/!I4,HCS02.1,Plc.PVL,.m_" + axis + "_" + type + "_pos_op", { value: parseInt(target)*10000 }, {
          error: function (t, d, x) {
            if (!verticalScanner.simulation) {
              callback({ error: { type: "server", source: "verticalScanner.move", msg: d.json() } })
            }
            else {
              webix.message("Benzetim modu")
              callback()
            }
          },
          success: function (t, d, x) {
            if (!verticalScanner.simulation) {
              if (d.json().error) callback(d.json())
              else callback()
            }
            else {
              webix.message("Benzetim modu")
              callback()
            }
          }
        })
      },
      function (callback) {
        webix.ajax().headers({
          "Content-type": "application/json"
        }).put(REST.url + "/opc/OPC.IwSCP.1/!BOOL,HCS02.1,Plc.PVL,.m_" + axis + "_" + type + "_posa_git_op", { value: "true" }, {
          error: function (t, d, x) {
            if (!verticalScanner.simulation) {
              callback({ error: { type: "server", source: "verticalScanner.move", msg: d.json() } })
            }
            else {
              webix.message("Benzetim modu")
              callback()
            }
          },
          success: function (t, d, x) {
            if (!verticalScanner.simulation) {
              if (d.json().error) callback(d.json())
              else callback()
            }
            else {
              webix.message("Benzetim modu")
              callback()
            }
          }
        })
      },
      function (callback) {
        async.whilst(
          function () {
            return true
          },
          function (callback) {
            webix.ajax().get(REST.url + "/opc/OPC.IwSCP.1/!BOOL,HCS02.1,Plc.PVL,.m_" + axis + "_" + type  + "_pos_ok", {
              error: function (t, d, x) {
                if (!verticalScanner.simulation) {
                  callback({ error: { type: "server", source: "verticalScanner.move", msg: d.json() } })
                }
                else {
                  verticalScanner.getPosition(axis, function (value) { posUpdate(stopTarget) })
                  webix.message("Benzetim modu")
                  callback("Finished");
                }
              },
              success: function (t, d, x) {
                if (!verticalScanner.simulation) {
                  verticalScanner.getPosition(axis, function (value) { posUpdate(value) })
                  if (d.json().error) callback(d.json())
                  else {
                    if (d.json()) callback("Finished");
                    else callback()
                  }
                }
                else {
                  verticalScanner.getPosition(axis, function (value) { posUpdate(stopTarget) })
                  webix.message("Benzetim modu")
                  callback("Finished")
                }
              }
            })
          },
          function (err) {
            if (err.error) callback(err)
            else callback()
          }
        )
      },
      function (callback) {
        webix.ajax().headers({
          "Content-type": "application/json"
        }).put(REST.url + "/opc/OPC.IwSCP.1/!BOOL,HCS02.1,Plc.PVL,.m_" + axis + "_" + type + "_posa_git_op", { value: "false" }, {
          error: function (t, d, x) {
            if (!verticalScanner.simulation) {
              callback({ error: { type: "server", source: "verticalScanner.move", msg: d.json() } })
            }
            else {
              webix.message("Benzetim modu")
              callback()
            }
          },
          success: function (t, d, x) {
            if (!verticalScanner.simulation) {
              if (d.json().error) callback(d.json())
              else callback()
            }
            else {
              webix.message("Benzetim modu")
              callback()
            }
          }
        })
      }
    ],
      function (err) {
        callback(err)
      })
  },
  getTriggerState: function (callback = function () { }) {
    webix.ajax().get(REST.url + "/opc/OPC.IwSCP.1/!BOOL,HCS02.1,Plc.PVL,.dikey_tarama_op", {
      error: function (t, d, x) {
        if (!verticalScanner.simulation) {
          callback({ error: { type: "server", source: "verticalScanner.getTriggerState", msg: d.json() } })
        }
        else {
          webix.message("Benzetim modu")
          callback(false)
        }
      },
      success: function (t, d, x) {
        if (!verticalScanner.simulation) {
          callback(d.json())
        }
        else {
          webix.message("Benzetim modu")
          callback(false)
        }
      }
    })
  },
  setTriggerState: function (value, callback = function () { }) {
    webix.ajax().headers({
      "Content-type": "application/json"
    }).put(REST.url + "/opc/OPC.IwSCP.1/!BOOL,HCS02.1,Plc.PVL,.dikey_tarama_op", { value: value }, {
      error: function (t, d, x) {
        if (!verticalScanner.simulation) {
          callback({ error: { type: "server", source: "verticalScanner.setTriggerState", msg: d.json() } })
        }
        else {
          webix.message("Benzetim modu")
          callback()
        }
      },
      success: function (t, d, x) {
        if (!verticalScanner.simulation) {
          callback()
        }
        else {
          webix.message("Benzetim modu")
          callback()
        }
      }
    })
  },
  getTriggerStep: function (callback = function () { }) {
    webix.ajax().get(REST.url + "/opc/OPC.IwSCP.1/!I4,HCS02.1,Plc.PVL,.tarama_araligi_op", {
      error: function (t, d, x) {
        if (!verticalScanner.simulation) {
          callback({ error: { type: "server", source: "verticalScanner.getTriggerState", msg: d.json() } })
        }
        else {
          webix.message("Benzetim modu")
          callback(1000)
        }
      },
      success: function (t, d, x) {
        if (!verticalScanner.simulation) {
          callback(parseInt(d.json() / 10000))
        }
        else {
          webix.message("Benzetim modu")
          callback(1000)
        }
      }
    })
  },
  setTriggerStep: function (value, callback = function () { }) {
    webix.ajax().headers({
      "Content-type": "application/json"
    }).put(REST.url + "/opc/OPC.IwSCP.1/!I4,HCS02.1,Plc.PVL,.tarama_araligi_op", { value: parseInt(value)*10000-500 }, {
      error: function (t, d, x) {
        if (!verticalScanner.simulation) {
          callback({ error: { type: "server", source: "verticalScanner.setTriggerState", msg: d.json() } })
        }
        else {
          webix.message("Benzetim modu")
          callback()
        }
      },
      success: function (t, d, x) {
        if (!verticalScanner.simulation) {
          callback()
        }
        else {
          webix.message("Benzetim modu")
          callback()
        }
      }
    })
  }
}