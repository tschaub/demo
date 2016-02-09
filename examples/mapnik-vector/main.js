var layers = [
  new ol.layer.Tile({
    source: new ol.source.MapQuest({layer: 'sat'})
  }),
  new ol.layer.VectorTile({
    source: new ol.source.VectorTile({
      url: 'http://localhost:3000/{z}/{x}/{y}.pbf',
      format: new ol.format.MVT(),
      tileGrid: ol.tilegrid.createXYZ({maxZoom: 22}),
      tilePixelRatio: 16
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
