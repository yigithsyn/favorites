setTimeout(function () {

  // Toolbar
  $$("sidemenuicon").attachEvent("onItemClick", function () {
    $$("multiview").setValue("home")
    $$("headbarLabel").setValue("KAMUS > Ana Sayfa")
  })

  // Multiview
  $$("home").attachEvent("onItemClick", function (id) {
    $$("multiview").setValue(this.getItem(id).id)
    $$("headbarLabel").setValue("KAMUS > " + this.getItem(id).value)
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
  $$("inventoryItemAddButton").attachEvent("onItemClick", function () {
    var formItems = []
    inventoryItemDetails.forEach(function (item) {
      delete item.readonly
      formItems.push(item)
    })
    var form = { id: "inventoryItemAddDetails", view: "form", readonly: true, rows: inventoryItemDetails }
    inventoryItemAdd.body.rows = [form]
    webix.ui(
      inventoryItemAdd
    ).show()
  
    // $$("inventoryItemImageUpload").attachEvent("onFileUpload", function (item, response) {
    //   console.log(response)
    // });
    // inventoryItemAdd.show()
  })
  

  // Manuel events
  REST.registerURL(function (res) {
    $$("jupyternb").load(REST.jupyternb_url)
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
  $$("multiview").setValue("inventory")
  // $$("multiview").setValue("jupyternb")
  // $$("sidelist").select("home")


}, 1000)