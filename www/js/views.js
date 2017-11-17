// home
var winmenuData = [
  { id: "database", value: "Veritabanı", img: "img/database_100x100_white.png", color: "#008ba0", x: 1, y: 1, width: 1 },
  { id: "stock", value: "Demirbaş", img: "img/barcode_100x100_white.png", color: "#535353", x: 2, y: 1, width: 1 },
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

// database
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

// stock
var images = [
  { id: 1, src: "img/database_100x100_white.png", title: "Image 1" },
  { id: 2, src: "img/barcode_100x100_white.png", title: "Image 2" },
  { id: 3, src: "imgs/image003.jpg", title: "Image 3" },
  { id: 4, src: "imgs/image004.jpg", title: "Image 4" },
  { id: 5, src: "imgs/image005.jpg", title: "Image 5" },
  { id: 6, src: "imgs/image006.jpg", title: "Image 6" }
];
var stockData = [
  { no: 1, serial: "wer1", name: "demirbaş1", model: "model1" },
  { no: 2, serial: "wer2", name: "demirbaş2", model: "model2" }
]
var stockRows = [
  { id: "stockList", view: "list", select: true, template: "#no# &nbsp&nbsp #name#", data: stockData },
  {
    id: "stockItemDetails", view: "form", rows: [
      { name: "no", view: "text", label: "Demirbaş numarası: ", labelWidth: 150, readonly: true },
      { name: "serial", view: "text", label: "Seri numarası: ", labelWidth: 150, readonly: true },
      { name: "name", view: "text", label: "Demirbaş adı: ", labelWidth: 150, readonly: true },
      { name: "model", view: "text", label: "Demirbaş marka: ", labelWidth: 150, readonly: true },
    ]
  },
  {
    view: "carousel",
    id: "carousel1",
    cols: [
      { css: "image", template: img, data: { src: "img/database_100x100_white.png", title: "Image 1" } },
      { css: "image", template: img, data: { src: "img/database_100x100_white.png", title: "Image 2" } },
    ],
    navigation: {
      type: "side"
    }
  },
  { view: "button", type: "icon", icon: "plus", label: 'Ekle', autowidth:true, align:"center"}
]
function img(obj) {
  // return '<img src="'+obj.src+'" style="text-align:center;" ondragstart="return false"/>'
  return '<div style="width:100%; height:100%; text-align: center; padding: 0; margin: 0;">' +
    '<span style="display: inline-block; height: 100%; vertical-align: middle; padding: 0; margin: 0;" ></span> ' +
    '<img style="display: inline-block; vertical-align: middle; padding: 0; margin: 0;" src="' + obj.src + '"/>' +
    '</div>'
}
// Multiview
var views = [
  { id: "home", value: "Ana Sayfa", view: "winmenu", borderless: true, data: winmenuData, xCount: 2, yCount: 4 },
  { id: "database", view: "layout", value: "Veritabanı", icon: "database", rows: databaseRows },
  { id: "stock", value: "Demirbaş", icon: "barcode", rows: stockRows },
  { id: "storage", value: "Depolama", icon: "cloud", template: "Cloud" }
]

