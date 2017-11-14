// Database
var databaseRows = [
  { id: "databaseTree", view: "tree", select: true, data: [], gravity: 1 },
  {
    id: "databaseItemViews", fitBiggest: true, gravity:1,
    cells: [
      { id: "databaseItemList", view: "list", template: "#title#", select: true, data: [] },
      {
        id: "databaseItemDetails", view: "form", rows: [
          { id:"result", view: "template", scroll: "xy" },
          { view: "button", value: "Back", click: function () { $$("databaseItemViews").back() } },
        ]
      }
    ]
  },
]

// Multiview
var views = [
  { id: "mlab", view: "layout", value: "Database", icon: "database", rows: databaseRows },
  { id: "onedrive", value: "Storage", icon: "cloud", template: "Cloud" }
]