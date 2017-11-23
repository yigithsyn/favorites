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
    var myDropzone = new Dropzone("div#inventoryAddItemImageDropzone", { withCredentials:false, url: REST.url + "/upload/Inventory", createImageThumbnails: false });
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

  // Manuel events
  REST.registerURL(function (res) {
    $$("jupyternb").load(REST.jupyternb_url)
    // if(window.location.href !== REST.url+"/index.html") window.location.replace(REST.url+"/index.html")
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
  $$("multiview").setValue("inventory")
  // $$("multiview").setValue("jupyternb")
  // $$("sidelist").select("home")


}, 1000)