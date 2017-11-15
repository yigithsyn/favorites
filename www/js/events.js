setTimeout(function () {



  // Toolbar
  $$("sidemenuicon").attachEvent("onItemClick", function () {
    $$("multiview").setValue("home")
  })

  // Multiview
  $$("home").attachEvent("onItemClick", function (id) {
    $$("multiview").setValue(this.getItem(id).id)
    $$("headbarLabel").setValue("KAMUS > " + views.filter(function (item) { return item.id == id })[0].value) 
  });

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
      el: $$("result").getNode(),
      data: obj
    });
    // console.log(obj)
    $$('databaseItemDetails').show();
  })

  // Manuel events
  REST.registerURL(function (res) {
    REST.TinyDB.listTables(function (tables) {
      var data = []
      async.eachSeries(tables,
        function (table, callback) {
          data.push({ value: table, data: [] })
          callback()
        },
        function (err) {
          $$("databaseTree").unselectAll()
          $$("databaseTree").clearAll()
          $$("databaseTree").parse(data)
          $$("databaseTree").openAll()
        })
    })
  })
  $$("multiview").setValue("home")
  // $$("sidelist").select("home")


}, 1000)