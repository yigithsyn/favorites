// plot default values
var plotTrace = { yaxis: 'y', y: [] };
var plotTrace1 = { yaxis: 'y1', y: [] };
var plotTrace2 = { xaxis: 'x2', yaxis: 'y2', y: [] };
var plotData = [plotTrace, plotTrace1, plotTrace2];
Plotly.setPlotConfig({
  displaylogo: false,
  modeBarButtonsToRemove: ['sendDataToCloud', "lasso2d", 'hoverCompareCartesian', "toggleSpikelines", "zoomIn2d", "zoomOut2d", "select2d"]
});
var plotLayout = {
  showlegend: false,
  autosize: false,
  margin: { l: 50, r: 25, b: 25, t: 15, pad: 4 },
  yaxis: { domain: [0, .400] },
  xaxis: { anchor: 'y1' },
  xaxis2: { anchor: 'y2' },
  yaxis2: { domain: [0.595, 1] },
};

// Line plot
// plotTrace1.type = plotTrace2.type = "scatter"
// plotTrace1.line = plotTrace2.line = { shape: 'spline' }
// // plotLayout.xaxis.range = plotLayout.xaxis2.range = [-0.5, 10 - 0.5]
// plotLayout.yaxis.exponentformat = plotLayout.yaxis2.exponentformat = "E"
// plotLayout.yaxis.showexponent = plotLayout.yaxis2.showexponent = "All"
// // plotLayout.width = parseInt($$("plot").getNode().style.width)
// // plotLayout.height = $$("plot").getNode().style.height - 15
// // Plotly.newPlot($$("plot").getNode(), plotData, plotLayout);

// Heatmap
plotTrace1.type = plotTrace2.type = "heatmap"
plotTrace2.colorbar = { y: 0.775, len: 0.4, exponentformat: "E", showexponent: "All" }
plotTrace1.colorbar = { y: 0.225, len: 0.4, exponentformat: "E", showexponent: "All" }
plotTrace1.z = []; plotTrace2.z = [];