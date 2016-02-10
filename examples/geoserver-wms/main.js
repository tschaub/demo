var base = new ol.layer.Tile({
  source: new ol.source.MapQuest({layer: 'sat'})
});

var wms = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {LAYERS: 'demo:gallatin_parcels'}
  })
});

var map = new ol.Map({
  target: 'map',
  controls: [],
  layers: [base, wms],
  view: new ol.View()
});

map.on('click', function(event) {
  var coord = event.coordinate;
  var bbox = [coord[0], coord[1], coord[0], coord[1], '\'EPSG:3857\''];
  var filter = 'BBOX(geom, ' + bbox.join(', ') + ');INCLUDE';
  wms.getSource().updateParams({
    CQL_FILTER: filter,
    LAYERS: 'demo:gallatin_parcels,demo:gallatin_parcels',
    STYLES: 'parcels-highlight,parcels'
  });
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
