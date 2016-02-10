var base = new ol.layer.Tile({
  source: new ol.source.MapQuest({layer: 'sat'})
});

var tiles = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'http://localhost:3000/{z}/{x}/{y}.png'
  })
});

var map = new ol.Map({
  target: 'map',
  controls: [],
  layers: [base, tiles],
  view: new ol.View()
});

var updateHash = hashed.register({
  center: {
    init: ol.proj.fromLonLat([-111.0440, 45.684]),
    serialize: function(coord) {
      var lonLat = ol.proj.toLonLat(coord);
      return lonLat[0].toFixed(3) + ',' + lonLat[1].toFixed(3);
    },
    deserialize: function(str) {
      return ol.proj.fromLonLat(str.split(',').map(Number));
    }
  },
  zoom: 12
}, function(hash) {
  var view = map.getView();
  if ('center' in hash) {
    view.setCenter(hash.center);
  }
  if ('zoom' in hash) {
    view.setZoom(hash.zoom)
  }
});

map.on('moveend', function() {
  var view = map.getView();
  updateHash({center: view.getCenter(), zoom: view.getZoom()});
});
