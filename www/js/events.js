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
  });

  // Manuel events
  REST.registerURL(function (res) {
    REST.TinyDB.listItems("jupyternb", function (res) {
      if (!res.error) {
        REST.jupyternb_url += "?token=" + res[0].token
        $$("jupyternb").load(REST.jupyternb_url)
      }
      else console.log(res)
    })
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
    REST.TinyDB.listItems("inventory", function (res) {
      if (!res.error) {
        $$("inventoryList").unselectAll()
        $$("inventoryList").clearAll()
        $$("inventoryList").parse(res)
      }
    })
  })

}, 1000)