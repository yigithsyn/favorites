var vectorNetworkAnalyzer = {
  visaAddress: "TCPIP0::192.168.2.6::inst0::INSTR",
  preset: [
    // Yatay Sistem
    // "SYST:PRES",
    // "CALC:PAR:DEL:ALL",
    // "CALC:PAR:EXT 'Genlik', S21",
    // "CALC:PAR:EXT 'Faz', S21",
    // "DISP:ARR OVER",
    // "CALC:PAR:MNUM 2",
    // "CALC:FORM PHAS",
    // "CALC:PAR:MNUM 1",
    // "CALC:FORM MLIN",

    // "SENS:SWE:TYPE CW",
    // "SENS:FREQ:CW 2ghz",

    // "TRIG:SOUR MAN",
    // "TRIG:SCOP CURR",
    // "SENS:SWE:TRIG:MODE POINt",
    // "CONT:SIGN BNC1,TILHIGH",
    // "TRIG:SLOP POS",
    // "TRIG:TYPE EDGE",

    // Dikey Sistem
    "SYST:PRES",
    "CALC:PAR:DEL:ALL",
    "CALC:PAR:EXT 'Genlik', S21",
    "CALC:PAR:EXT 'Faz', S21",
    "DISP:ARR OVER",
    "CALC:PAR:MNUM 2",
    "CALC:FORM PHAS",
    "CALC:PAR:MNUM 1",
    "CALC:FORM MLIN",

    "SENS:SWE:TYPE CW",
    "SENS:FREQ:CW 2ghz",

    "TRIG:SOUR EXT",
    "TRIG:SCOP CURR",
    "SENS:SWE:TRIG:MODE POINt",
    "CONT:SIGN AUXT,TILHIGH",
    "TRIG:SLOP POS",
    "TRIG:TYPE EDGE",
  ],
  connect: function (callback = function () { }) {
    webix.ajax().post(REST.url + "/visa/" + vectorNetworkAnalyzer.visaAddress, {}, function (t, d, h) {
      if (d.json().error) webix.message(d.json().error)
      else {
        callback()
      }
    })
  },
  initialize: function (callback = function () { }) {
    async.eachSeries(vectorNetworkAnalyzer.preset,
      function (cmd, callback) {
        webix.ajax().put(REST.url + "/visa/" + vectorNetworkAnalyzer.visaAddress, { buff: cmd }, function (t, d, h) {
          if (d.json().error) webix.message(d.json().error)
          else { callback(null) }
        })
      },
      function (err) {
        callback()
      }
    )
  },
  setTriggerManuel: function (callback = function () { }) {
    webix.ajax().put(REST.url + "/visa/" + vectorNetworkAnalyzer.visaAddress, { buff: "TRIG:SOUR MAN" }, function (t, d, h) {
      if (d.json().error) webix.message(d.json().error)
      else { callback() }
    })
  },
  setTriggerExternal: function (callback = function () { }) {
    webix.ajax().put(REST.url + "/visa/" + vectorNetworkAnalyzer.visaAddress, { buff: "TRIG:SOUR EXT" }, function (t, d, h) {
      if (d.json().error) webix.message(d.json().error)
      else { callback() }
    })
  },
  triggerManuel: function (callback = function () { }) {
    webix.ajax().put(REST.url + "/visa/" + vectorNetworkAnalyzer.visaAddress, { buff: "INIT:IMM" }, function (t, d, h) {
      if (d.json().error) webix.message(d.json().error)
      else { callback() }
    })
  },
  setFrequency: function (freq, callback = function () { }) {
    webix.ajax().put(REST.url + "/visa/" + vectorNetworkAnalyzer.visaAddress, { buff: "SENS:FREQ:CW " + String(freq) + "ghz" }, function (t, d, h) {
      if (d.json().error) webix.message(d.json().error)
      else { callback(); }
    })
  },
  setSweepPoints: function(n, callback = function () { }) {
    webix.ajax().put(REST.url + "/visa/" + vectorNetworkAnalyzer.visaAddress, { buff: "SENS:SWE:POIN " + String(n) }, function (t, d, h) {
      if (d.json().error) webix.message(d.json().error)
      else { callback(); }
    })
  },
  getTraceData: function(trace, callback = function () { }) {
  webix.ajax().put(REST.url + "/visa/" + vectorNetworkAnalyzer.visaAddress, { buff: "CALCulate:PARameter:MNUMber:SELect " + String(trace) }, function (t, x, h) {
    if (x.json().error) {
      webix.message(x.json().error)
      callback([])
    }
    else {
      webix.ajax().get(REST.url + "/visa/" + vectorNetworkAnalyzer.visaAddress, { query: "CALCulate:DATA? FDATA" }, function (t, x, h) {
        if (x.json().error) {
          webix.message(x.json().error)
          callback([])
        }
        else {
          var data = x.json().res.map(function (item) { return parseFloat(item) })
          callback(data)
        }
      })
    }
  })
}
  
}