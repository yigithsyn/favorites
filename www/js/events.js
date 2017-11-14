setTimeout(function () {
  // Toolbar
  $$("sidemenuicon").attachEvent("onItemClick", function () {
    if ($$("sidemenu").config.hidden) $$("sidemenu").show();
    else $$("sidemenu").hide();
  })

  // Side Menu
  $$("sidelist").attachEvent("onSelectChange", function (id) {
    $$("multiview").setValue(id)
    $$("sidemenu").hide()
    $$("headbarLabel").setValue("KAMUS > " + views.filter(function (item) { return item.id == id })[0].value)
  })

  // Database
  $$("databaseTree").attachEvent("onSelectChange", function (id) {
    var item = $$("databaseTree").getItem(id)
    // console.log(item)
    if (item.$level === 2) {
      var collection = item.value
      var database = $$("databaseTree").getItem(item.$parent).value
      REST.mLab.listItems(database, collection, {}, false, function (items) {
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
      el:$$("result").getNode(),
      data:obj
    });
    // console.log(obj)
    $$('databaseItemDetails').show();
  })

  // Manuel events
  $$("sidelist").select("mlab")
  REST.mLab.listDatabases(function (databases) {
    var data = []
    async.eachSeries(databases,
      function (database, callback) {
        data.push({ value: database, data: [] })
        REST.mLab.listCollections(database, function (collections) {
          async.eachSeries(collections,
            function (collection, callback) {
              data[data.length - 1].data.push({ value: collection })
              callback()
            },
            function (err) {
              callback()
            })
        })
      },
      function (err) {
        $$("databaseTree").unselectAll()
        $$("databaseTree").clearAll()
        $$("databaseTree").parse(data)
        $$("databaseTree").openAll()
      })
  })

}, 1000)