var REST = {
  url: "http://127.0.0.1:5000",
  jupyternb_url: "http://127.0.0.1:8888",
  registerURL: function (callback = function () { }) {
    REST.mLab.listItems("hsyn", "ngrok", {}, false, function (res) {
      if (!res.error) {
        REST.url = res[0].url
        REST.jupyternb_url = res[1].url + "?token=" + res[1].token
        callback(REST.url)
      }
      else{
        callback(res)
      }
    })
  },
  TinyDB: {
    listTables: function (callback = function () { }) {
      webix.ajax().get(REST.url + "/tinydb", {
        error: function (t, d, x) {
          callback({ error: { type: "server", msg: d.json() } })
        },
        success: function (t, d, x) {
          callback(d.json())
        }
      })
    },
    listItems: function (table, callback = function () { }) {
      webix.ajax().get(REST.url + "/tinydb/"+table, {
        error: function (t, d, x) {
          callback({ error: { type: "server", msg: d.json() } })
        },
        success: function (t, d, x) {
          callback(d.json())
        }
      })
    },
  },
  mLab: {
    apiKey: "Do4rql-3HdmtYmJE5oz9rHVILV5Mos9d",
    listItems: function (database, collection, query = {}, count = false, callback = function () { }) {
      webix.ajax().get("https://api.mlab.com/api/1/databases/" + database + "/collections/" + collection, { apiKey: REST.mLab.apiKey, q: query, c: count }, {
        error: function (t, d, x) {
          callback({ error: { type: "server", msg: d.json() } })
        },
        success: function (t, d, x) {
          var items = d.json()
          async.eachSeries(items,
            function (item, callback) {
              item.id = item._id.$oid
              delete item._id
              callback()
            },
            function (err) {
              if (err) console.log(err)
              else callback(items)
            })
        }
      })
    },
  }
}


// var REST = {
//   url: "http://127.0.0.1:5000",
//   TinyDB: {

//     insertItem: function (table, local = false, callback = function () { }) {
//       webix.ajax().get(REST.url + "/tinydb/" + table + "?local=" + local, {}, {
//         error: function (t, d, x) {
//           callback({ error: { type: "server", msg: d.json() } })
//         },
//         success: function (t, d, x) {
//           callback(d.json())
//         }
//       })
//     }
//   },
//   mLab: {
//     // apiKey: "",
//     listDatabases: function (callback = function () { }) {
//       webix.ajax().get("https://api.mlab.com/api/1/databases", { apiKey: REST.mLab.apiKey }, function (t, d, x) {
//         // console.log(d.json())
//         callback(d.json())
//       })
//     },
//     listCollections: function (database, callback = function () { }) {
//       webix.ajax().get("https://api.mlab.com/api/1/databases/" + database + "/collections", { apiKey: REST.mLab.apiKey }, function (t, d, x) {
//         // console.log(d.json())
//         callback(d.json().filter(function (item) { return item.indexOf("system") === -1 }))
//       })
//     },

//     insertItems: function (database, collection, items, callback = function () { }) {
//       webix.ajax().headers({ "Content-type": "application/json" }).post("https://api.mlab.com/api/1/databases/" + database + "/collections/" + collection + "?apiKey=" + REST.mLab.apiKey, JSON.stringify(items), function (t, d, x) {
//         // console.log(d.json())
//         callback()
//       })
//     },
//     updateItem: function (database, collection, id, item, callback = function () { }) {
//       webix.ajax().headers({ "Content-type": "application/json" }).put("https://api.mlab.com/api/1/databases/" + database + "/collections/" + collection + "/" + id + "?apiKey=" + REST.mLab.apiKey, JSON.stringify(item), function (t, d, x) {
//         // console.log(d.json())
//         callback()
//       })
//     },
//     deleteItem: function (database, collection, id, callback = function () { }) {
//       webix.ajax().del("https://api.mlab.com/api/1/databases/" + database + "/collections/" + collection + "/" + id + "?apiKey=" + REST.mLab.apiKey, function (t, d, x) {
//         // console.log(d.json())
//         callback()
//       })
//     },
//   }
// }