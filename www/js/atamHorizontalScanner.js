var atamHorizontalScanner = {
  simulation: false,
  Lx: 1000,
  Ly: 1000,
  x0: 500,
  y0: 500,
  connect: function (callback = function () { }) {
    webix.ajax().post(REST.url + "/serialport/COM1?baud=38400", {
      error: function (t, d, x) {
        if (!atamHorizontalScanner.simulation) {
          webix.confirm({
            title: "Benzetim modu",
            ok: "Evet",
            cancel: "Hayır",
            text: "Bağlantı kurulamadı. Benzetim modunda devam edilsin mi?",
            callback: function (result) {
              atamHorizontalScanner.simulation = result
              if (result) callback("connected")
              else callback({ error: { type: "server", source: "atamHorizontalScanner.connect", msg: d.json() } })
            }
          });
        }
        else {
          callback("connected")
        }
      },
      success: function (t, d, x) {
        if (d.json().error) {
          callback(d.json())
        }
        else {
          webix.ajax().post(REST.url + "/serialport/COM2?baud=38400", function (t, d, x) {
            callback(d.json())
          })
        }
      }
    })
  },
  sendCommand: function (axis, cmd, callback = function () { }) {
    port = (axis == "x") ? "COM1" : "COM2"
    webix.ajax().put(REST.url + "/serialport/" + port + "?buff=" + cmd, {
      error: function (t, d, x) {
        if (!atamHorizontalScanner.simulation) {
          callback({ error: { type: "server", source: "atamHorizontalScanner.getPosition", msg: d.json() } })
        }
        else {
          webix.message("Benzetim modu")
          callback(0)
        }
      },
      success: function (t, d, x) {
        if (d.json().error) {
          callback(d.json())
        }
        else {
          res = []
          async.whilst(
            function () { return true },
            function (callback) {
              webix.ajax().get(REST.url + "/serialport/" + port, function (t, d, x) {
                if (d.json().error) {
                  callback(d.json())
                }
                else {
                  if (d.json().length === 1 && d.json()[0] == "") callback(res)
                  else {
                    res = res.concat(d.json())
                    callback()
                  }
                }
              })
            },
            function (err) {
              callback(err)
            }
          )
        }
      }
    })
  },
  getPosition: function (axis, callback = function () { }) {
    atamHorizontalScanner.sendCommand(axis, "PFB", function (res) {
      if (res.error) {
        callback(res.error)
      }
      else {
        callback(parseInt(res[res.indexOf("PFB") + 1]))
      }
    })
  },
  move: function (axis, type, target, posUpdate = function () { }, callback = function () { }) {
    axis = (axis == "y") ? "z" : axis
    var currPos = 0
    var stopTarget = 0
    atamHorizontalScanner.getPosition(axis, function (value) {
      currPos = value
      stopTarget = (type == "abs") ? parseInt(target) : currPos + parseInt(target)
    })
    async.series([
      function (callback) {
        webix.ajax().headers({
          "Content-type": "application/json"
        }).put(REST.url + "/opc/OPC.IwSCP.1/!BOOL,HCS02.1,Plc.PVL,.m_" + axis + "_" + type + "_posa_git_op", { value: "false" }, {
          error: function (t, d, x) {
            if (!atamHorizontalScanner.simulation) {
              callback({ error: { type: "server", source: "atamHorizontalScanner.move", msg: d.json() } })
            }
            else {
              webix.message("Benzetim modu")
              callback()
            }
          },
          success: function (t, d, x) {
            if (!atamHorizontalScanner.simulation) {
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
        }).put(REST.url + "/opc/OPC.IwSCP.1/!I4,HCS02.1,Plc.PVL,.m_" + axis + "_" + type + "_pos_op", { value: parseInt(target) * 10000 }, {
          error: function (t, d, x) {
            if (!atamHorizontalScanner.simulation) {
              callback({ error: { type: "server", source: "atamHorizontalScanner.move", msg: d.json() } })
            }
            else {
              webix.message("Benzetim modu")
              callback()
            }
          },
          success: function (t, d, x) {
            if (!atamHorizontalScanner.simulation) {
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
            if (!atamHorizontalScanner.simulation) {
              callback({ error: { type: "server", source: "atamHorizontalScanner.move", msg: d.json() } })
            }
            else {
              webix.message("Benzetim modu")
              callback()
            }
          },
          success: function (t, d, x) {
            if (!atamHorizontalScanner.simulation) {
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
            webix.ajax().get(REST.url + "/opc/OPC.IwSCP.1/!BOOL,HCS02.1,Plc.PVL,.m_" + axis + "_" + type + "_pos_ok", {
              error: function (t, d, x) {
                if (!atamHorizontalScanner.simulation) {
                  callback({ error: { type: "server", source: "atamHorizontalScanner.move", msg: d.json() } })
                }
                else {
                  atamHorizontalScanner.getPosition(axis, function (value) { posUpdate(stopTarget) })
                  webix.message("Benzetim modu")
                  callback("Finished");
                }
              },
              success: function (t, d, x) {
                if (!atamHorizontalScanner.simulation) {
                  atamHorizontalScanner.getPosition(axis, function (value) { posUpdate(value) })
                  if (d.json().error) callback(d.json())
                  else {
                    if (d.json()) callback("Finished");
                    else callback()
                  }
                }
                else {
                  atamHorizontalScanner.getPosition(axis, function (value) { posUpdate(stopTarget) })
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
            if (!atamHorizontalScanner.simulation) {
              callback({ error: { type: "server", source: "atamHorizontalScanner.move", msg: d.json() } })
            }
            else {
              webix.message("Benzetim modu")
              callback()
            }
          },
          success: function (t, d, x) {
            if (!atamHorizontalScanner.simulation) {
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
        if (!atamHorizontalScanner.simulation) {
          callback({ error: { type: "server", source: "atamHorizontalScanner.getTriggerState", msg: d.json() } })
        }
        else {
          webix.message("Benzetim modu")
          callback(false)
        }
      },
      success: function (t, d, x) {
        if (!atamHorizontalScanner.simulation) {
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
        if (!atamHorizontalScanner.simulation) {
          callback({ error: { type: "server", source: "atamHorizontalScanner.setTriggerState", msg: d.json() } })
        }
        else {
          webix.message("Benzetim modu")
          callback()
        }
      },
      success: function (t, d, x) {
        if (!atamHorizontalScanner.simulation) {
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
        if (!atamHorizontalScanner.simulation) {
          callback({ error: { type: "server", source: "atamHorizontalScanner.getTriggerState", msg: d.json() } })
        }
        else {
          webix.message("Benzetim modu")
          callback(1000)
        }
      },
      success: function (t, d, x) {
        if (!atamHorizontalScanner.simulation) {
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
    }).put(REST.url + "/opc/OPC.IwSCP.1/!I4,HCS02.1,Plc.PVL,.tarama_araligi_op", { value: parseInt(value) * 10000 - 500 }, {
      error: function (t, d, x) {
        if (!atamHorizontalScanner.simulation) {
          callback({ error: { type: "server", source: "atamHorizontalScanner.setTriggerState", msg: d.json() } })
        }
        else {
          webix.message("Benzetim modu")
          callback()
        }
      },
      success: function (t, d, x) {
        if (!atamHorizontalScanner.simulation) {
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