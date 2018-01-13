setTimeout(function () {

  // Toolbar
  $$("sidemenuicon").attachEvent("onItemClick", function () {
    $$("multiview").setValue("home")
  })

  // headerLabel
  $$("headerLabel1").attachEvent("onItemClick", function () {
    var value = this.getValue()
    var view = views.filter(function (item) { return item.value == value })[0]
    $$(view.id).setValue(view.id + "Home")
    $$("headerLabel2").hide()
    $$("headerLabel3").hide()
    $$("headerLabel12").hide()
    $$("headerLabel23").hide()
  })

  $$("headerLabel2").attachEvent("onItemClick", function () {
    var parent = $$("headerLabel1").getValue()
    var parentView = views.filter(function (item) { return item.value == parent })[0]
    var view = $$(parentView.id).getValue()
    $$(view).setValue(view + "Home")
    $$("headerLabel3").hide()
    $$("headerLabel23").hide()
  })

  // Multiview
  $$("home").attachEvent("onItemClick", function (id) {
    $$("multiview").setValue(this.getItem(id).id)
  });

  $$("multiview").attachEvent("onChange", function () {
    var id = $$("multiview").getValue()
    var view = views.filter(function (item) { return item.id == id })[0]
    if (view.id != "home") $$(view.id).setValue(view.id + "Home")
    $$("headerLabel1").setValue(view.value)
    $$("headerLabel1").define("width", view.labelWidth);
    $$("headerLabel1").resize()
    $$("headerLabel2").hide()
    $$("headerLabel3").hide()
    $$("headerLabel12").hide()
    $$("headerLabel23").hide()
  });

  // Database
  $$("databaseTree").attachEvent("onSelectChange", function (id) {
    var item = $$("databaseTree").getItem(id)
    if (item.$level === 1) {
      REST.TinyDB.listItems(item.value, function (items) {
        $$("databaseItemViews").back()
        $$("databaseItemList").blockEvent()
        $$("databaseItemList").unselectAll()
        $$("databaseItemList").clearAll()
        $$("databaseItemList").parse(items)
        $$("databaseItemList").unblockEvent()
      })
    }
  })
  // $$('databaseItemDetails').bind($$('databaseItemList'));
  $$("databaseItemList").attachEvent("onSelectChange", function (id) {
    var obj = $$("databaseItemList").getItem(id)
    new PrettyJSON.view.Node({
      el: $$("result").getNode(),
      data: obj
    });
    // console.log(obj)
    $$('databaseItemDetails').show();
  })

  // Inventory
  $$("inventoryItemDetails").bind($$("inventoryList"))
  $$("inventoryList").attachEvent("onSelectChange", function (id) {
    var item = $$("inventoryList").getItem(id)
    ids = []
    item.files.forEach(function (item) { ids.push($$("inventoryItemImages").addView({ template: inventoryItemImage, data: { src: REST.url + "/download/Inventory/" + item } })) })
    $$("inventoryItemImages").setActiveIndex(0);
    if (ids.indexOf($$("inventoryItemImages").getActiveId()) == -1) {
      $$("inventoryItemImages").removeView($$("inventoryItemImages").getActiveId())
    }
    _.range(10).forEach(function (item) {
      // console.log(ids)
      // console.log(String($$("inventoryItemImages").getActiveId()))
      if (ids.indexOf(String($$("inventoryItemImages").getActiveId())) === -1) {
        $$("inventoryItemImages").removeView($$("inventoryItemImages").getActiveId())
      }
      $$("inventoryItemImages").showNext();
    })
    if (ids.indexOf(String($$("inventoryItemImages").getActiveId())) === -1) {
      $$("inventoryItemImages").removeView($$("inventoryItemImages").getActiveId())
    }
    $$("inventoryItemImages").setActiveIndex(0);
  })

  $$("inventoryItemAddButton").attachEvent("onItemClick", function () {
    var formItems = []
    inventoryItemDetails.forEach(function (item) { delete item.readonly; formItems.push(item) })
    var form = { id: "inventoryItemAddDetails", view: "form", readonly: true, rows: inventoryItemDetails }
    inventoryItemAdd.body.rows[0] = form
    webix.ui(inventoryItemAdd).show()
    $$("inventoryItemAddImageList").clearAll()


    document.getElementById("inventoryAddItemImage").removeAttribute("hidden")
    var myDropzone = new Dropzone("div#inventoryAddItemImageDropzone", { withCredentials: false, url: REST.url + "/upload/Inventory", createImageThumbnails: false });
    myDropzone.on("success", function (file, res) {
      $$("inventoryItemAddImageList").add({ name: file.name, size: fileSizeToString(file.size), filename: res })
    });
    myDropzone.on("error", function (file, errorMessage, xhtmlerror) {
      console.log(errorMessage)
      console.log(xhtmlerror)
    });

    $$("inventoryItemAddFinishButton").attachEvent("onItemClick", function () {
      var item = $$("inventoryItemAddDetails").getValues()
      item.files = []
      $$("inventoryItemAddImageList").find(function () { return true }).forEach(function (file) { item.files.push(file.filename) })
      REST.TinyDB.insertItem("inventory", item, function (res) {
        item.id = res
        $$("inventoryList").add(item)
      })
      $$("inventoryItemAdd").close()
    })
  })

  //===========================================================================
  // kodyap
  //===========================================================================
  //...........................................................................
  // kodyapVerticalMovement
  //...........................................................................
  $$("kodyapVerticalMovementXSpeed").attachEvent("onChange", function (newv, oldv) { verticalScanner.setSpeed("x", newv) })
  $$("kodyapVerticalMovementYSpeed").attachEvent("onChange", function (newv, oldv) { verticalScanner.setSpeed("y", newv) })

  $$("kodyapVerticalMovementXMoveHome").attachEvent("onItemClick", function () {
    verticalScanner.move("x", "abs", 0,
      function (value) {
        $$("kodyapVerticalMovementXPos").setValue(value)
      },
      function () {
        console.log("Hareket tamamlandı.")
      }
    )
  })
  $$("kodyapVerticalMovementYMoveHome").attachEvent("onItemClick", function () {
    verticalScanner.move("y", "abs", 0,
      function (value) {
        $$("kodyapVerticalMovementYPos").setValue(value)
      },
      function () {
        console.log("Hareket tamamlandı.")
      }
    )
  })

  $$("kodyapVerticalMovementXMoveCenter").attachEvent("onItemClick", function () {
    verticalScanner.move("x", "abs", 2000,
      function (value) {
        $$("kodyapVerticalMovementXPos").setValue(value)
      },
      function () {
        console.log("Hareket tamamlandı.")
      }
    )
  })
  $$("kodyapVerticalMovementYMoveCenter").attachEvent("onItemClick", function () {
    verticalScanner.move("y", "abs", 1000,
      function (value) {
        $$("kodyapVerticalMovementYPos").setValue(value)
      },
      function () {
        console.log("Hareket tamamlandı.")
      }
    )
  })

  $$("kodyapVerticalMovementXMoveAbs").attachEvent("onItemClick", function () {
    verticalScanner.move("x", "abs", $$("kodyapVerticalMovementXMoveAbsVal").getValue(),
      function (value) {
        $$("kodyapVerticalMovementXPos").setValue(value)
      },
      function () {
        console.log("Hareket tamamlandı.")
      }
    )
  })
  $$("kodyapVerticalMovementYMoveAbs").attachEvent("onItemClick", function () {
    verticalScanner.move("y", "abs", $$("kodyapVerticalMovementYMoveAbsVal").getValue(),
      function (value) {
        $$("kodyapVerticalMovementYPos").setValue(value)
      },
      function () {
        console.log("Hareket tamamlandı.")
      }
    )
  })

  $$("kodyapVerticalMovementXMoveRel").attachEvent("onItemClick", function () {
    verticalScanner.move("x", "rel", $$("kodyapVerticalMovementXMoveRelVal").getValue(),
      function (value) {
        $$("kodyapVerticalMovementXPos").setValue(value)
      },
      function () {
        console.log("Hareket tamamlandı.")
      }
    )
  })
  $$("kodyapVerticalMovementYMoveRel").attachEvent("onItemClick", function () {
    verticalScanner.move("y", "rel", $$("kodyapVerticalMovementYMoveRelVal").getValue(),
      function (value) {
        $$("kodyapVerticalMovementYPos").setValue(value)
      },
      function () {
        console.log("Hareket tamamlandı.")
      }
    )
  })

  //...........................................................................
  // kodyapVerticalMeasurement
  //...........................................................................
  $$("kodyapVerticalMeasurementScanAreaX0").attachEvent("onChange", function (newv, oldv) { $$("kodyapVerticalMeasurementFrequencyFreq").callEvent("onChange", [$$("kodyapVerticalMeasurementFrequencyFreq").getValue(), 0]) })
  $$("kodyapVerticalMeasurementScanAreaY0").attachEvent("onChange", function (newv, oldv) { $$("kodyapVerticalMeasurementFrequencyFreq").callEvent("onChange", [$$("kodyapVerticalMeasurementFrequencyFreq").getValue(), 0]) })

  $$("kodyapVerticalMeasurementScanAreaLx").attachEvent("onChange", function (newv, oldv) { $$("kodyapVerticalMeasurementFrequencyFreq").callEvent("onChange", [$$("kodyapVerticalMeasurementFrequencyFreq").getValue(), 0]) })
  $$("kodyapVerticalMeasurementScanAreaLy").attachEvent("onChange", function (newv, oldv) { $$("kodyapVerticalMeasurementFrequencyFreq").callEvent("onChange", [$$("kodyapVerticalMeasurementFrequencyFreq").getValue(), 0]) })

  $$("kodyapVerticalMeasurementScanAreaSquareScan").attachEvent("onChange", function (newv, oldv) {
    if (newv === 0) {
      $$("kodyapVerticalMeasurementScanAreaLy").define("disabled", false)
      $$("kodyapVerticalMeasurementSamplingNy").define("disabled", false)
    }
    else {
      $$("kodyapVerticalMeasurementFrequencyFreq").callEvent("onChange", [$$("kodyapVerticalMeasurementFrequencyFreq").getValue(), 0])
      $$("kodyapVerticalMeasurementScanAreaLy").define("disabled", true)
      $$("kodyapVerticalMeasurementSamplingNy").define("disabled", true)
    }
  })

  $$("kodyapVerticalMeasurementFrequencyWavelen").attachEvent("onChange", function (newv, oldv) {
    var wavelength = parseFloat(newv)
    if (wavelength) {
      var freq = 3E8 / (wavelength / 1E3) / 1E9
      $$("kodyapVerticalMeasurementFrequencyFreq").setValue(freq.toFixed(2))
    }
  })

  $$("kodyapVerticalMeasurementFrequencyFreq").attachEvent("onChange", function (newv, oldv) {
    var freq = parseFloat(newv)
    if (freq) {
      var wavelength = 3E8 / (freq * 1E9) * 1E3
      $$('kodyapVerticalMeasurementFrequencyWavelen').blockEvent();
      $$("kodyapVerticalMeasurementFrequencyWavelen").setValue(wavelength.toFixed(2))
      $$('kodyapVerticalMeasurementFrequencyWavelen').unblockEvent();
      var d = Math.floor(wavelength / 2)
      $$("kodyapVerticalMeasurementSamplingD").setValue(d)

      // x-axis 
      if ($$("kodyapVerticalMeasurementScanAreaLx").getValue()) {
        var N = 0
        var L = parseFloat($$("kodyapVerticalMeasurementScanAreaLx").getValue())
        var x0 = parseFloat($$("kodyapVerticalMeasurementScanAreaX0").getValue())
        async.whilst(
          function () { return L % d !== 0; },
          function (callback) { L++; callback() },
          function (err) {
            async.whilst(
              function () { return L > verticalScanner.Lx || L / 2 > Math.min(verticalScanner.Lx - x0, x0); },
              function (callback) { L -= d; callback() },
              function (err) {
                N = L / d + 1
                $$('kodyapVerticalMeasurementScanAreaLx').blockEvent();
                if (N % 2 == 0) {
                  $$("kodyapVerticalMeasurementScanAreaLx").setValue(N * d)
                  N += 1
                  if ((N - 1) * d > verticalScanner.Lx || (N - 1) * d / 2 > Math.min(verticalScanner.Lx - x0, x0)) {
                    N -= 2
                    $$("kodyapVerticalMeasurementScanAreaLx").setValue((N - 1) * d)
                  }
                }
                else {
                  $$("kodyapVerticalMeasurementScanAreaLx").setValue(L)
                }
                $$("kodyapVerticalMeasurementSamplingNx").setValue(N)
                if ($$("kodyapVerticalMeasurementScanAreaSquareScan").getValue() === 1) {
                  if (L > verticalScanner.Ly) {
                    $$("kodyapVerticalMeasurementScanAreaSquareScan").setValue(0)
                    setTimeout(function () { $$("kodyapVerticalMeasurementScanAreaLy").define("disabled", false) }, 100)
                    setTimeout(function () { $$("kodyapVerticalMeasurementSamplingNy").define("disabled", false) }, 100)
                  }
                  else $$("kodyapVerticalMeasurementScanAreaLy").setValue($$("kodyapVerticalMeasurementScanAreaLx").getValue())
                }
                $$('kodyapVerticalMeasurementScanAreaLx').unblockEvent();
              }
            )
          }
        )
      }
      // y-axis
      if ($$("kodyapVerticalMeasurementScanAreaLy").getValue()) {
        var N = 0
        var L = parseFloat($$("kodyapVerticalMeasurementScanAreaLy").getValue())
        var y0 = parseFloat($$("kodyapVerticalMeasurementScanAreaY0").getValue())
        async.whilst(
          function () { return L % d !== 0; },
          function (callback) { L++; callback() },
          function (err) {
            async.whilst(
              function () { return L > verticalScanner.Ly || L / 2 > Math.min(verticalScanner.Ly - y0, y0); },
              function (callback) { L -= d; callback() },
              function (err) {
                N = L / d + 1
                $$("kodyapVerticalMeasurementScanAreaLy").blockEvent();
                if (N % 2 == 0) {
                  $$("kodyapVerticalMeasurementScanAreaLy").setValue(N * d)
                  N += 1
                  if ((N - 1) * d > verticalScanner.Ly || (N - 1) * d / 2 > Math.min(verticalScanner.Ly - y0, y0)) {
                    N -= 2
                    $$("kodyapVerticalMeasurementScanAreaLy").setValue((N - 1) * d)
                  }
                }
                else {
                  $$("kodyapVerticalMeasurementScanAreaLy").setValue(L)
                }
                $$("kodyapVerticalMeasurementSamplingNy").setValue(N)
                if ($$("kodyapVerticalMeasurementScanAreaSquareScan").getValue() === 1) {
                  if (L > verticalScanner.Lx) {
                    $$("kodyapVerticalMeasurementScanAreaSquareScan").setValue(0)
                    setTimeout(function () { $$("kodyapVerticalMeasurementScanAreaLx").define("disabled", false) }, 100)
                    setTimeout(function () { $$("kodyapVerticalMeasurementSamplingNx").define("disabled", false) }, 100)
                  }
                  else $$("kodyapVerticalMeasurementScanAreaLx").setValue($$("kodyapVerticalMeasurementScanAreaLy").getValue())
                }
                $$("kodyapVerticalMeasurementScanAreaLy").unblockEvent();
              }
            )
          }
        )
      }
    }
  })

  $$("kodyapVerticalMeasurementStart").attachEvent("onItemClick", function () {
    var x0 = parseInt($$("kodyapVerticalMeasurementScanAreaX0").getValue())
    var y0 = parseInt($$("kodyapVerticalMeasurementScanAreaY0").getValue())
    var Lx = parseInt($$("kodyapVerticalMeasurementScanAreaLx").getValue())
    var Ly = parseInt($$("kodyapVerticalMeasurementScanAreaLy").getValue())
    var freq = parseFloat($$("kodyapVerticalMeasurementFrequencyFreq").getValue())
    var Nx = parseInt($$("kodyapVerticalMeasurementSamplingNx").getValue())
    var Ny = parseInt($$("kodyapVerticalMeasurementSamplingNy").getValue())
    var d = parseInt($$("kodyapVerticalMeasurementSamplingD").getValue())

    $$("kodyapVerticalMeasurementRunLabel").setValue($$("kodyapVerticalMeasurementLoggingName").getValue())
    $$("kodyapVertical").setValue("kodyapVerticalMeasurementRun")

    var meas = { name: $$("kodyapVerticalMeasurementLoggingName").getValue(), data: { amp: [], phase: [] } }

    setTimeout(function () {
      plotLayout.xaxis.range = plotLayout.xaxis2.range = [-(Nx - 1) / 2 - 0.5, (Nx - 1) / 2 + 0.5]
      plotLayout.yaxis.range = plotLayout.yaxis2.range = [-(Nx - 1) / 2 - 0.5, (Nx - 1) / 2 + 0.5]
      plotLayout.width = parseInt($$("plot").getNode().style.width)
      plotLayout.height = parseInt($$("plot").getNode().style.height)
      Plotly.newPlot($$("plot").getNode(), plotData, plotLayout);
      plotTrace1.x = _.range(-(Nx - 1) / 2, (Nx - 1) / 2 + 1)
      plotTrace2.x = _.range(-(Nx - 1) / 2, (Nx - 1) / 2 + 1)
      plotTrace1.y = _.range(-(Nx - 1) / 2, (Nx - 1) / 2 + 1)
      plotTrace2.y = _.range(-(Nx - 1) / 2, (Nx - 1) / 2 + 1)
    }, 2000)
    plotDataAmp = []
    plotDataPhase = []

    async.series([
      function (callback) { vectorNetworkAnalyzer.initialize(callback) },
      function (callback) { vectorNetworkAnalyzer.setFrequency(freq, callback) },
      function (callback) { vectorNetworkAnalyzer.setSweepPoints(Ny - 1, callback) },

      function (callback) { verticalScanner.setTriggerState("false", callback) },
      function (callback) { verticalScanner.setTriggerStep(d, callback) },

      function (callback) {
        verticalScanner.move("x", "abs", x0 - Lx / 2, function (value) { $$("kodyapVerticalMovementXPos").setValue(value) }, function () {
          verticalScanner.move("y", "abs", y0 - Ly / 2, function (value) { $$("kodyapVerticalMovementYPos").setValue(value) }, function () {
            async.eachSeries(_.range(1, Nx + 1),
              function (item, callback) {
                var amp0 = 0;
                var phase0 = 0;
                async.series([
                  function (callback) { vectorNetworkAnalyzer.setTriggerManuel(callback) },
                  function (callback) { vectorNetworkAnalyzer.triggerManuel(callback) },
                  function (callback) {
                    vectorNetworkAnalyzer.getTraceData(1, function (data) {
                      amp0 = data[0]
                      vectorNetworkAnalyzer.getTraceData(2, function (data) {
                        phase0 = data[0]
                        callback()
                      })
                    })
                  },
                  function (callback) { verticalScanner.setTriggerState("true", callback) },
                  function (callback) { vectorNetworkAnalyzer.setTriggerExternal(callback) },
                  function (callback) {
                    if (item % 2 == 1) {
                      verticalScanner.move("y", "rel", Ly, function (value) { $$("kodyapVerticalMovementYPos").setValue(value) }, function () {
                        vectorNetworkAnalyzer.getTraceData(1, function (data) {
                          data.unshift(amp0)
                          if (Nx > Ny) {
                            for (i = 0; i < (Nx - Ny) / 2; i++) {
                              data.unshift(0)
                              data.push(0)
                            }
                          }
                          plotDataAmp[item - 1] = data
                          plotTrace1.z = _.zip.apply(_, plotDataAmp)
                          meas.data.amp.push(data)
                          vectorNetworkAnalyzer.getTraceData(2, function (data) {
                            data.unshift(phase0)
                            if (Nx > Ny) {
                              for (i = 0; i < (Nx - Ny) / 2; i++) {
                                data.unshift(0)
                                data.push(0)
                              }
                            }
                            plotDataPhase[item - 1] = data
                            plotTrace2.z = _.zip.apply(_, plotDataPhase)
                            meas.data.phase.push(data)
                            plotData = [plotTrace1, plotTrace2];
                            Plotly.update($$("plot").getNode(), plotData, plotLayout)
                          })
                        })
                        if (item < Nx) verticalScanner.move("x", "rel", d, function (value) { $$("kodyapVerticalMovementXPos").setValue(value) }, callback)
                        else callback("Finished.")
                      })
                    }
                    else {
                      verticalScanner.move("y", "rel", -Ly, function (value) { $$("kodyapVerticalMovementYPos").setValue(value) }, function () {
                        vectorNetworkAnalyzer.getTraceData(1, function (data) {
                          data.unshift(amp0)
                          data.reverse()
                          if (Nx > Ny) {
                            for (i = 0; i < (Nx - Ny) / 2; i++) {
                              data.unshift(0)
                              data.push(0)
                            }
                          }
                          plotDataAmp[item - 1] = data
                          plotTrace1.z = _.zip.apply(_, plotDataAmp)
                          meas.data.amp.push(data)
                          vectorNetworkAnalyzer.getTraceData(2, function (data) {
                            data.unshift(phase0)
                            data.reverse()
                            if (Nx > Ny) {
                              for (i = 0; i < (Nx - Ny) / 2; i++) {
                                data.unshift(0)
                                data.push(0)
                              }
                            }
                            plotDataPhase[item - 1] = data
                            plotTrace2.z = _.zip.apply(_, plotDataPhase)
                            meas.data.phase.push(data)
                            plotData = [plotTrace1, plotTrace2];
                            Plotly.update($$("plot").getNode(), plotData, plotLayout)
                          })
                        })
                        if (item < Nx) verticalScanner.move("x", "rel", d, function (value) { $$("kodyapVerticalMovementXPos").setValue(value) }, callback)
                        else callback("Finished.")
                      })
                    }
                  },
                  function (callback) { verticalScanner.setTriggerState("false", callback) },
                ], function (err) {
                  callback()
                })
              },
              function (err) {
                setTimeout(function () {
                  var data = "text/json; charset = utf-8," + encodeURIComponent(JSON.stringify(meas))
                  var a = document.createElement('a')
                  a.href = 'data: ' + data;
                  a.download = "ölçüm.json"
                  a.click()
                  webix.message("Tarama tamamlandı.")
                  callback()
                }, 3000)
              }
            )
          })


        })
      }
    ], function (err) {

    })
  });

  //---------------------------------------------------------------------------
  // kodyapVertical
  //---------------------------------------------------------------------------
  $$("kodyapVerticalHome").attachEvent("onItemClick", function (id) {
    $$("kodyapVertical").setValue(this.getItem(id).id)
  });

  $$("kodyapVertical").attachEvent("onViewChange", function (prev, next) {
    var view = kodyapVerticalViews.filter(function (item) { return item.id == next })[0]
    $$("headerLabel3").setValue(view.value)
    $$("headerLabel3").show()
    $$("headerLabel3").define("width", view.labelWidth);
    $$("headerLabel3").resize()
    $$("headerLabel23").show()
  });

  //---------------------------------------------------------------------------
  // kodyapHome
  //---------------------------------------------------------------------------
  $$("kodyapHome").attachEvent("onItemClick", function (id) {
    $$("kodyap").setValue(this.getItem(id).id)
  });

  $$("kodyap").attachEvent("onViewChange", function (prev, next) {
    var view = kodyapViews.filter(function (item) { return item.id == next })[0]
    if (view.id.indexOf("Home") === -1) $$(view.id).setValue(view.id + "Home")
    $$("headerLabel2").setValue(view.value)
    $$("headerLabel2").show()
    $$("headerLabel2").define("width", view.labelWidth);
    $$("headerLabel2").resize()
    $$("headerLabel3").hide()
    $$("headerLabel12").show()
    $$("headerLabel23").hide()
    if (next == "kodyapVertical") {
      vectorNetworkAnalyzer.connect(function (res) {

      })
      verticalScanner.connect(function (res) {
        verticalScanner.getPosition("x", function (res) { $$("kodyapVerticalMovementXPos").setValue(res) })
        verticalScanner.getPosition("y", function (res) { $$("kodyapVerticalMovementYPos").setValue(res) })
        verticalScanner.getSpeed("x", function (res) { $$("kodyapVerticalMovementXSpeed").setValue(res) })
        verticalScanner.getSpeed("y", function (res) { $$("kodyapVerticalMovementYSpeed").setValue(res) })
      })
    }
  });

  //===========================================================================
  // atam
  //===========================================================================
  //---------------------------------------------------------------------------
  // atamMeasScheduler
  //---------------------------------------------------------------------------
  scheduler.config.xml_date = "%j.%n.%Y %G:%i";
  scheduler.config.time_step = 60
  scheduler.config.first_hour = 9
  scheduler.config.last_hour = 17
  scheduler.config.readonly = true
  readWriteAllowedIPs = ["10.18.90.243","10.18.82.158"]
 
  scheduler.templates.event_bar_text = function (start, end, event) {
    return "<b>Sistem: </b>" + event.system + "<br>" +
      "<b>Müşteri / Proje: </b>" + event.customer + "<br>" +
      "<b>S. Sorumlusu: </b>" + event.responsible + "<br>" +
      "<b>Ö. Sorumlusu: </b>" + event.user + "<br>" +
      "<b>Açıklama: </b>" + event.text
  }
  scheduler.templates.event_text = function (start, end, event) {
    return "<b>Sistem: </b>" + event.system + "<br>" +
      "<b>Müşteri / Proje: </b>" + event.customer + "<br>" +
      "<b>S. Sorumlusu: </b>" + event.responsible + "<br>" +
      "<b>Ö. Sorumlusu: </b>" + event.user
  }
  scheduler.templates.event_class = function (start, end, event) {
    var css = ""
    if(event.system){
      css += "event_" + event.system
    }
    return css
  }
  scheduler.config.lightbox.sections[5] = scheduler.config.lightbox.sections[1]
  scheduler.config.lightbox.sections[4] = scheduler.config.lightbox.sections[0]
  scheduler.config.lightbox.sections[0] = {
    name: "Sistem", height: 34, type: "select", map_to: "system", options: [
      { key: "Küresel", label: "Küresel - Küresel Yakın Alan Ölçüm Sistemi" },
      { key: "Dikey", label: "Dikey - Alt Milimetrik Band Dikey Yakın Alan Ölçüm Sistemi" },
      { key: "Yatay", label: "Yatay - Milimetrik Band Yatay Yakın Alan Ölçüm Sistemi" },
    ]
  }
  scheduler.config.lightbox.sections[1] = { name: "Müşteri / Proje", height: 34, type: "textarea", map_to: "customer" }
  scheduler.config.lightbox.sections[2] = {
    name: "Sistem Sorumlusu", height: 34, type: "select", map_to: "responsible", options: [
      { key: "Fatma", label: "Fatma ZENGİN" },
      { key: "Göksenin", label: "Göksenin BOZDAĞ" },
    ]
  }
  scheduler.config.lightbox.sections[3] = {
    name: "Ölçüm Sorumlusu", height: 34, type: "select", map_to: "user", options: [
      { key: "Eren", label: "Eren AKKAYA" },
      { key: "Fatma", label: "Fatma ZENGİN" },
      { key: "Göksenin", label: "Göksenin BOZDAĞ" },
      { key: "Hüseyin", label: "Hüseyin YİĞİT" },
      { key: "Koray", label: "Koray SÜRMELİ" },
      { key: "Nazlı", label: "Nazlı CANDAN" },
      { key: "Okan", label: "Okan Mert YÜCEDAĞ" },
      { key: "Onur", label: "Onur ARI" },
      { key: "Ömer", label: "Ömer YILMAZ" },
      { key: "Özge", label: "Özge" },
      { key: "Sultan", label: "Sultan ÇALIŞKAN" },
      { key: "Türker", label: "Türker İSENLİK" },
    ]
  }
  scheduler.attachEvent("onEventAdded", function (id, ev) {
    console.log(ev)
    var item = { text: ev.text, system: ev.system, customer: ev.customer, responsible: ev.responsible, user: ev.user }
    item.start_date = String(ev.start_date.getDate()) + "." + String(ev.start_date.getMonth() + 1) + "." + String(ev.start_date.getFullYear()) + " "
    item.start_date += String(ev.start_date.getHours()) + ":" + (ev.start_date.getMinutes() < 10 ? "0" + String(ev.start_date.getMinutes()) : String(ev.start_date.getMinutes()))
    item.end_date = String(ev.end_date.getDate()) + "." + String(ev.end_date.getMonth() + 1) + "." + String(ev.end_date.getFullYear()) + " "
    item.end_date += String(ev.end_date.getHours()) + ":" + (ev.end_date.getMinutes() < 10 ? "0" + String(ev.end_date.getMinutes()) : String(ev.end_date.getMinutes()))
    // console.log(ev.start_date)
    // var item = ev
    // item.id = id
    // item.start_date = ev.start_date.toString().slice(0, -3)
    // item.end_date = ev.end_date.toString().slice(0, -3)
    console.log(item)
    REST.TinyDB.insertItem("atamMeasScheduler", item, function (res) {
      console.log(res)
      REST.TinyDB.listItems("atamMeasScheduler", function (items) {
        console.log(items)
        scheduler.clearAll()
        scheduler.parse(items, "json")
        var eventsSingleDay = document.getElementsByClassName("dhx_cal_event_clear dhx_cal_event_line_start dhx_cal_event_line_end")
       
      })
    })
  })
  scheduler.attachEvent("onEventChanged", function (id, ev) {
    // console.log(ev)
    var item = { id: ev.id, text: ev.text, system: ev.system, customer: ev.customer, responsible: ev.responsible, user: ev.user }
    item.start_date = String(ev.start_date.getDate()) + "." + String(ev.start_date.getMonth() + 1) + "." + String(ev.start_date.getFullYear()) + " "
    item.start_date += String(ev.start_date.getHours()) + ":" + (ev.start_date.getMinutes() < 10 ? "0" + String(ev.start_date.getMinutes()) : String(ev.start_date.getMinutes()))
    item.end_date = String(ev.end_date.getDate()) + "." + String(ev.end_date.getMonth() + 1) + "." + String(ev.end_date.getFullYear()) + " "
    item.end_date += String(ev.end_date.getHours()) + ":" + (ev.end_date.getMinutes() < 10 ? "0" + String(ev.end_date.getMinutes()) : String(ev.end_date.getMinutes()))
    // console.log(item)
    REST.TinyDB.updateItem("atamMeasScheduler", item, function (res) {
      console.log(res)
      REST.TinyDB.listItems("atamMeasScheduler", function (items) {
        console.log(items)
        scheduler.clearAll()
        scheduler.parse(items, "json")
        var eventsSingleDay = document.getElementsByClassName("dhx_cal_event_clear dhx_cal_event_line_start dhx_cal_event_line_end")
       
      })
    })
  })
  scheduler.attachEvent("onConfirmedBeforeEventDelete", function (id, ev) {
    console.log(ev)
    REST.TinyDB.deleteItem("atamMeasScheduler", ev, function (res) {
      console.log(res)
      REST.TinyDB.listItems("atamMeasScheduler", function (items) {
        console.log(items)
        scheduler.clearAll()
        scheduler.parse(items, "json")
       
      })
    })
  })
  

  //---------------------------------------------------------------------------
  // atamHome
  //---------------------------------------------------------------------------
  $$("atamHome").attachEvent("onItemClick", function (id) {
    $$("atam").setValue(this.getItem(id).id)
  });

  $$("atam").attachEvent("onViewChange", function (prev, next) {
    var view = atamViews.filter(function (item) { return item.id == next })[0]
    $$("headerLabel2").setValue(view.value)
    $$("headerLabel2").show()
    $$("headerLabel2").define("width", view.labelWidth);
    $$("headerLabel2").resize()
    $$("headerLabel3").hide()
    $$("headerLabel12").show()
    $$("headerLabel23").hide()
    if (next == "atamMeasScheduler") {
      $$("leftBlankSpace").hide()
      $$("rightBlankSpace").hide()
      $$("body").define("width", window.innerWidth)
      $$("body").resize()
      scheduler.init('atamMeasScheduler', new Date(), "month");
      REST.TinyDB.listItems("atamMeasScheduler", function (items) {
        console.log(items)
        scheduler.parse(items, "json")
      })
      REST.Client.getClient(function(res){
        if(readWriteAllowedIPs.indexOf(res.ip) > -1){
          scheduler.config.readonly = false
        }
      })
    }
    else {
      $$("body").define("width", $$("body").$height / 2)
      $$("body").resize()
      $$("leftBlankSpace").show()
      $$("rightBlankSpace").show()
    }
  });

  // Manuel events
  // REST.registerURL(function (res) {
  //   REST.TinyDB.listItems("jupyternb", function (res) {
  //     if (!res.error) {
  //       //REST.jupyternb_url += "?token=" + res[0].token
  //       $$("jupyternb").load(REST.jupyternb_url)
  //     }
  //     else console.log(res)
  //   })
  //   REST.TinyDB.listTables(function (tables) {
  //     var data = []
  //     async.eachSeries(tables,
  //       function (table, callback) {
  //         data.push({ value: table, data: [] })
  //         callback()
  //       },
  //       function (err) {
  //         $$("databaseTree").unselectAll()
  //         $$("databaseTree").clearAll()
  //         $$("databaseTree").parse(data)
  //         $$("databaseTree").openAll()
  //       })
  //   })
  //   REST.TinyDB.listItems("inventory", function (res) {
  //     if (!res.error) {
  //       $$("inventoryList").unselectAll()
  //       $$("inventoryList").clearAll()
  //       $$("inventoryList").parse(res)
  //     }
  //   })
  // })



}, 1000)