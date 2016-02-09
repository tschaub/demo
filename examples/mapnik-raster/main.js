var layers = [
  new ol.layer.Tile({
    source: new ol.source.MapQuest({layer: 'sat'})
  }),
  new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'http://localhost:3000/{z}/{x}/{y}.png'
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
