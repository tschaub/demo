var base = new ol.layer.Tile({
  source: new ol.source.MapQuest({layer: 'sat'})
});

var wms = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {LAYERS: 'demo:gallatin_parcels', TILED: 'true'}
  })
});

var vector = new ol.layer.Vector({
  source: new ol.source.Vector({
    features: []
  }),
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(0,143,213,0.6)'
    })
  })
});

var map = new ol.Map({
  target: 'map',
  layers: [base, vector, wms],
  controls: [],
  view: new ol.View({
    center: ol.proj.fromLonLat([-111.0440, 45.684]),
    zoom: 12
  })
});

function parse(collection) {
  var source = vector.getSource();
  source.clear();
  if (collection && collection.features && collection.features.length) {
    var format = new ol.format.GeoJSON();
    source.addFeatures(format.readFeatures(collection));
  }
}

map.on('click', function(event) {
  var coord = event.coordinate;
  var bbox = [coord[0], coord[1], coord[0], coord[1], '\'EPSG:3857\''];
  var params = {
    service: 'WFS',
    version: '1.1.0',
    request: 'GetFeature',
    typeName: 'demo:gallatin_parcels',
    maxFeatures: 1,
    outputFormat: 'text/javascript',
    format_options: 'callback:parse',
    srsName: 'EPSG:3857',
    cql_filter: 'BBOX(geom, ' + bbox.join(', ') + ')'
  };

  var script = document.createElement('script');
  var head = document.getElementsByTagName('head')[0];
  script.src = 'http://localhost:8080/geoserver/wfs?' + Object.keys(params).map(function(key) {
    return key + '=' + encodeURIComponent(params[key]);
  }).join('&');
  head.appendChild(script);
});
