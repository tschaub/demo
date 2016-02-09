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
  view: new ol.View({
    center: ol.proj.fromLonLat([-111.0440, 45.684]),
    zoom: 12
  })
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
