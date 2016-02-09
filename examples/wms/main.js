var layers = [
  new ol.layer.Tile({
    source: new ol.source.MapQuest({layer: 'sat'})
  }),
  new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {LAYERS: 'demo:gallatin_parcels'}
    })
  })
];
var map = new ol.Map({
  layers: layers,
  target: 'map',
  view: new ol.View({
    center: ol.proj.fromLonLat([-111.0440, 45.684]),
    zoom: 12
  })
});
