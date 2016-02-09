var base = new ol.layer.Tile({
  source: new ol.source.MapQuest({layer: 'sat'})
});

var tiles = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'http://localhost:3000/{z}/{x}/{y}.png'
  })
});

var grid = new ol.layer.Tile({
  source: new ol.source.TileUTFGrid({
    url: 'http://localhost:3000/raster.json',
    preemptive: false
  })
});

var map = new ol.Map({
  target: 'map',
  controls: [],
  layers: [base, tiles, grid],
  view: new ol.View({
    center: ol.proj.fromLonLat([-111.0440, 45.684]),
    zoom: 18
  })
});

map.on('pointermove', function(event) {
  var resolution = map.getView().getResolution();
  grid.getSource().forDataAtCoordinateAndResolution(event.coordinate, resolution, function(data) {
    console.log(data);
  }, null, true);
});
