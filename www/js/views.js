
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

// Inventory
var inventoryItemDetails = [
  { name: "no", view: "text", label: "Demirbaş numarası ", labelWidth: 150 },
  { name: "serial", view: "text", label: "Seri numarası ", labelWidth: 150, readonly: true },
  { name: "name", view: "text", label: "Demirbaş adı ", labelWidth: 150, readonly: true },
  { name: "model", view: "text", label: "Demirbaş marka ", labelWidth: 150, readonly: true }
]
var inventoryRows = [
  { id: "inventoryList", view: "list", select: true, template: "#no# &nbsp&nbsp #name#", data: [] },
  { id: "inventoryItemDetails", view: "form", readonly: true, rows: inventoryItemDetails },
  {
    view: "carousel", id: "inventoryItemImages", height: 180, navigation: { type: "side" }, cols: [
      { template: inventoryItemImage, data: { src: "img/database_100x100_white.png", title: "Image 1" } },
    ]
  },
  { cols: [{}, { id: "inventoryItemAddButton", view: "button", type: "icon", icon: "plus", label: 'Ekle', autowidth: true, align: "center" }, {}] }
]
function inventoryItemImage(obj) {
  // return '<img src="'+obj.src+'" style="text-align:center;" ondragstart="return false"/>'
  return '<div style="width:100%; height:100%; text-align: center; padding: 0; margin: 0;">' +
    '<span style="display: inline-block; height: 100%; vertical-align: middle; padding: 0; margin: 0;" ></span> ' +
    '<img height=90 style="display: inline-block; vertical-align: middle; padding: 0; margin: 0;" src="' + obj.src + '"/>' +
    '</div>'
}

var inventoryItemAdd = {
  id: "inventoryItemAdd", view: "window", head: "Demirbaş ekle", modal: true,
  head: {
    view: "toolbar", margin: -4, cols: [
      { view: "label", label: "Demirbaş ekle" },
      { view: "icon", icon: "times-circle", click: "$$('inventoryItemAdd').close();" }
    ]
  },
  body: {
    rows: [
      {},
      { view: "template", content: "inventoryAddItemImage", height: 25 },
      { view: "list", id: "inventoryItemAddImageList", type: "uploader", height: 100, borderless: true, select: true, template: "#name#<span style='float:right;'>#size#</span>" },
      { id: "inventoryItemAddFinishButton", view: "button", type: "icon", icon: "check", label: 'Tamamla', autowidth: true, align: "center" },
    ]
  },
  position: function (state) {
    state.left = 0; //fixed values
    state.top = 47;
    state.width = $$("body").$height / 2; //relative values
    state.height += 0;
  }
}

//=============================================================================
// kodyap
//=============================================================================
//-----------------------------------------------------------------------------
// kodyapVertical
//-----------------------------------------------------------------------------
//.............................................................................
// kodyapVerticalMovement
//.............................................................................
var kodyapVerticalMovementAxisX = {
  id: "kodyapVerticalMovementX",
  value: "X",
  rows: [
    {
      cols: [
        { id: "kodyapVerticalMovementXPos", view: "text", label: "Anlık Konum", labelWidth: 140, readonly: true },
        { view: "label", label: "mm", width: 60, align: "left" },
      ]
    },
    {
      cols: [
        { id: "kodyapVerticalMovementXSpeed", view: "text", label: "Konumlama Hızı", labelWidth: 140 },
        { view: "label", label: "m/dk", align: "left", width: 60 },
      ]
    },
    {
      cols: [
        { id: "kodyapVerticalMovementXMoveHome", view: "button", label: "Sıfırla", gravity: 1 },
        { id: "kodyapVerticalMovementXMoveCenter", view: "button", label: "Ortala", gravity: 1 },
      ]
    },
    {
      cols: [
        { id: "kodyapVerticalMovementXMoveAbsVal", view: "text", label: "Git (Mutlak)", labelWidth: 120 },
        { view: "label", label: "mm", width: 50, align: "left" },
        { id: "kodyapVerticalMovementXMoveAbs", view: "button", label: "Git", width: 100 }
      ]
    },
    {
      cols: [
        { id: "kodyapVerticalMovementXMoveRelVal", view: "text", label: "Git (Göreceli)", labelWidth: 120 },
        { view: "label", label: "mm", width: 50, align: "left" },
        { id: "kodyapVerticalMovementXMoveRel", view: "button", label: "Git", width: 100 },
      ]
    },
  ]
}

var kodyapVerticalMovementAxisY = {
  id: "kodyapVerticalMovementY",
  value: "Y",
  rows: [
    {
      cols: [
        { id: "kodyapVerticalMovementYPos", view: "text", label: "Anlık Konum", labelWidth: 140, readonly: true },
        { view: "label", label: "mm", width: 60, align: "left" },
      ]
    },
    {
      cols: [
        { id: "kodyapVerticalMovementYSpeed", view: "text", label: "Konumlama Hızı", labelWidth: 140 },
        { view: "label", label: "m/dk", align: "left", width: 60 },
      ]
    },
    {
      cols: [
        { id: "kodyapVerticalMovementYMoveHome", view: "button", label: "Sıfırla", gravity: 1 },
        { id: "kodyapVerticalMovementYMoveCenter", view: "button", label: "Ortala", gravity: 1 },
      ]
    },
    {
      cols: [
        { id: "kodyapVerticalMovementYMoveAbsVal", view: "text", label: "Git (Mutlak)", labelWidth: 120 },
        { view: "label", label: "mm", width: 50, align: "left" },
        { id: "kodyapVerticalMovementYMoveAbs", view: "button", label: "Git", width: 100 }
      ]
    },
    {
      cols: [
        { id: "kodyapVerticalMovementYMoveRelVal", view: "text", label: "Git (Göreceli)", labelWidth: 120 },
        { view: "label", label: "mm", width: 50, align: "left" },
        { id: "kodyapVerticalMovementYMoveRel", view: "button", label: "Git", width: 100 },
      ]
    },
  ]
}

var kodyapVerticalMovementAxisViews = [
  kodyapVerticalMovementAxisX,
  kodyapVerticalMovementAxisY
]

var kodyapVerticalMovementRows = [
  { template: "camera" },
  { id: "kodyapVerticalMovementAxis", borderless: true, view: "tabbar", multiview: true, options: kodyapVerticalMovementAxisViews },
  { cells: kodyapVerticalMovementAxisViews, keepViews: true }
]

//.............................................................................
// kodyapVerticalMeasurement
//.............................................................................
var kodyapVerticalMeasurementScanArea = {
  view: "fieldset",
  label: "Tarama Alanı",
  body: {
    rows: [
      {
        cols: [
          {
            cols: [
              { id: "kodyapVerticalMeasurementScanAreaX0", view: "text", label: "x0: ", labelWidth: 35 },
              { view: "label", label: "mm", width: 50, align: "left" },
            ],
            gravity: 1,
          },
          {
            cols: [
              { id: "kodyapVerticalMeasurementScanAreaY0", view: "text", label: "y0: ", labelWidth: 35 },
              { view: "label", label: "mm", width: 50, align: "left" },
            ],
            gravity: 1,
          }
        ],
        margin: 15
      },
      {
        cols: [
          {
            cols: [
              { id: "kodyapVerticalMeasurementScanAreaLx", view: "text", label: "Lx:", labelWidth: 35 },
              { view: "label", label: "mm", width: 50, align: "left" },
            ],
            gravity: 1,
          },
          {
            cols: [
              { id: "kodyapVerticalMeasurementScanAreaLy", view: "text", label: "Ly:", labelWidth: 35 },
              { view: "label", label: "mm", width: 50, align: "left" },
            ],
            gravity: 1,
          },
        ],
        margin: 15
      },
      { id: "kodyapVerticalMeasurementScanAreaSquareScan", view: "checkbox", label: "Kare Tarama:", labelWidth: 100 }
    ]
  },
}

var kodyapVerticalMeasurementFrequency = {
  view: "fieldset",
  label: "Frekans",
  body: {
    rows: [
      {
        cols: [
          { id: "kodyapVerticalMeasurementFrequencyFreq", view: "text", label: "Frekans: ", labelWidth: 100 },
          { view: "label", label: "GHz", align: "left", width: 50 },
        ]
      },
      {
        cols: [
          { id: "kodyapVerticalMeasurementFrequencyWavelen", view: "text", label: "Dalga Boyu: ", labelWidth: 100 },
          { view: "label", label: "mm", align: "left", width: 50 },
        ]
      },
    ]
  },
}

kodyapVerticalMeasurementSampling =   {
  view: "fieldset",
  label: "Örnekleme",
  body: {
    rows: [
      {
        cols: [
          { id: "kodyapVerticalMeasurementSamplingD", view: "text", label: "Sıklığı:", labelWidth: 100, readonly: true },
          { view: "label", label: "mm", align: "left", width: 50 },
        ]
      },
      {
        cols: [
          { id: "kodyapVerticalMeasurementSamplingN", view: "text", label: "Sayısı:", labelWidth: 100, readonly: true },
          { view: "label", label: "", align: "left", width: 50 },
        ], hidden: true
      },
      {
        cols: [
          { id: "kodyapVerticalMeasurementSamplingNx", view: "text", label: "Sayısı (X):", labelWidth: 100, readonly: true },
          { view: "label", label: "", align: "left", width: 50 },
        ]
      },
      {
        cols: [
          { id: "kodyapVerticalMeasurementSamplingNy", view: "text", label: "Sayısı (Y):", labelWidth: 100, readonly: true },
          { view: "label", label: "", align: "left", width: 50 },
        ]
      },
    ]
  },
}

kodyapVerticalMeasurementLogging =  {
  view: "fieldset",
  label: "Kayıt",
  body: {
    rows: [
      { id: "kodyapVerticalMeasurementLoggingName", view: "text", labelWidth: 100, label: "Ölçüm adı:", value: "Deneme" },
    ]
  },
}

var kodyapVerticalMeasurementRows = [
  kodyapVerticalMeasurementScanArea,
  kodyapVerticalMeasurementFrequency,
  kodyapVerticalMeasurementSampling,
  kodyapVerticalMeasurementLogging,
  { id: "kodyapVerticalMeasurementStart", view: "button", label: "Başlat" },
]

//.............................................................................
// kodyapVerticalHome
//.............................................................................
var kodyapVerticalMenuData = [
  { id: "kodyapVerticalMovement", value: "Hareket", img: "img/mi_directions_100x100.png", color: "#603cbb", x: 1, y: 1 },
  { id: "kodyapVerticalMeasurement", value: "Ölçüm", img: "img/feather_move_100x100.png", color: "#603cbb", x: 2, y: 1 },
];

var kodyapVerticalViews = [
  { id: "kodyapVerticalHome", value: "", labelWidth: 0, view: "winmenu", borderless: true, data: kodyapVerticalMenuData, xCount: 2, yCount: 4 },
  { id: "kodyapVerticalMovement", value: "Hareket", labelWidth: 70, rows: kodyapVerticalMovementRows },
  { id: "kodyapVerticalMeasurement", value: "Ölçüm", labelWidth: 60, rows: kodyapVerticalMeasurementRows, margin:15 },
]

//-----------------------------------------------------------------------------
// kodyapHome
//-----------------------------------------------------------------------------
var kodyapMenuData = [
  { id: "kodyapVertical", value: "Dikey Sistem", img: "img/fa-arrows-v-100x100.png", color: "#603cbb", x: 1, y: 1 },
  { id: "kodyapHorizontal", value: "Yatay Sistem", img: "img/fa-arrows-h-100x100.png", color: "#603cbb", x: 2, y: 1 },
  { id: "kodyapArchieve", value: "Ölçüm Arşivi", img: "img/fa-search-100x100.png", color: "#603cbb", x: 1, y: 2 },
];

var kodyapViews = [
  { id: "kodyapHome", value: "", labelWidth: 0, view: "winmenu", borderless: true, data: kodyapMenuData, xCount: 2, yCount: 4 },
  { id: "kodyapVertical", value: "Dikey", labelWidth: 53, cells: kodyapVerticalViews, keepViews: true },
  { id: "kodyapHorizontal", value: "Yatay", labelWidth: 53, template: "Yatay" },
  { id: "kodyapArchieve", value: "Ölçümler", labelWidth: 60, template: "Ölçümler" }
]

//=============================================================================
// home
//=============================================================================
var winmenuData = [
  { id: "database", value: "Veritabanı", img: "img/database_100x100_white.png", color: "#008ba0", x: 1, y: 1, width: 1 },
  { id: "inventory", value: "Demirbaş", img: "img/barcode_100x100_white.png", color: "#535353", x: 2, y: 1, width: 1 },
  { id: "jupyternb", value: "JupyterNB", img: "img/jupyternb_white_100x100.png", color: "#603cbb", x: 1, y: 2, width: 1 },
  { id: "kodyap", value: "KODYAP", img: "img/kodyap_100x100.png", color: "#00a300", x: 2, y: 2, width: 1 },
  // { value: "Finance", img: "icons/03.png", color: "#008ba0", x: 1, y: 1, width: 2 },
  // { value: "Settings", img: "icons/06.png", color: "#603cbb", x: 1, y: 2, width: 2 },
  // { value: "People", img: "icons/34.png", color: "#d9532c", x: 1, y: 3, width: 2 },
  // { value: "Calendar", img: "icons/12.png", color: "#535353", x: 3, y: 1 },
  // { value: "Store", img: "icons/18.png", color: "#00a300", x: 4, y: 1 },
  // { value: "Email", img: "icons/20.png", color: "#a400ab", x: 3, y: 2 },
  // { value: "Music", img: "icons/22.png", color: "#0a57c0", x: 4, y: 2 },
  // { value: "Photos", img: "icons/09.png", color: "#00889e", x: 3, y: 3, width: 2 }
];
// Multiview
var views = [
  { id: "home", value: "Ana Sayfa", labelWidth: 90, view: "winmenu", borderless: true, data: winmenuData, xCount: 2, yCount: 4 },
  { id: "database", view: "layout", value: "Veritabanı", labelWidth: 95, icon: "database", rows: databaseRows },
  { id: "inventory", value: "Demirbaş", labelWidth: 90, icon: "barcode", rows: inventoryRows },
  { id: "storage", value: "Depolama", labelWidth: 90, icon: "cloud", template: "Cloud" },
  { id: "jupyternb", value: "JupyterNB", labelWidth: 90, view: "iframe", src: "" },
  { id: "kodyap", value: "KODYAP", labelWidth: 76, cells: kodyapViews, keepViews: true },
]

