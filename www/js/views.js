// Database
var databaseRows = [
  { id: "databaseTree", view: "tree", select: true, data: [], gravity: 1 },
  {
    id: "databaseItemViews", fitBiggest: true, gravity: 1,
    cells: [
      { id: "databaseItemList", view: "list", template: "#title#", select: true, data: [] },
      {
        id: "databaseItemDetails", view: "form", rows: [
          { id: "result", view: "template", scroll: "xy" },
          { view: "button", value: "Back", click: function () { $$("databaseItemViews").back() } },
        ]
      }
    ]
  },
]

var winmenuData = [
  { id: "database", value: "Database", img: "img/database_100x100_color.png", color: "#008ba0", x: 1, y: 1, width: 1 },
  // { value: "Finance", img: "icons/03.png", color: "#008ba0", x: 1, y: 1, width: 2 },
  // { value: "Settings", img: "icons/06.png", color: "#603cbb", x: 1, y: 2, width: 2 },
  // { value: "People", img: "icons/34.png", color: "#d9532c", x: 1, y: 3, width: 2 },
  // { value: "Calendar", img: "icons/12.png", color: "#535353", x: 3, y: 1 },
  // { value: "Store", img: "icons/18.png", color: "#00a300", x: 4, y: 1 },
  // { value: "Email", img: "icons/20.png", color: "#a400ab", x: 3, y: 2 },
  // { value: "Music", img: "icons/22.png", color: "#0a57c0", x: 4, y: 2 },
  // { value: "Photos", img: "icons/09.png", color: "#00889e", x: 3, y: 3, width: 2 }
];

// var data2 = [
//   { value: "Documents", img: "icons/24.png", color: "#d9532c", x: 1, y: 1, width: 2 },
//   { value: "Games", img: "icons/30.png", color: "#008ba0", x: 1, y: 2 },
//   { value: "Video", img: "icons/32.png", color: "#a400ab", x: 2, y: 2 }
// ];
// Multiview
var views = [
  { id: "home", value: "Home", view: "winmenu", borderless: true, data: winmenuData, xCount: 2, yCount: 4 },
  { id: "database", view: "layout", value: "Database", icon: "database", rows: databaseRows },
  { id: "onedrive", value: "Storage", icon: "cloud", template: "Cloud" }
]