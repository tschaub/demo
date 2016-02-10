mapboxgl.accessToken = 'pk.eyJ1IjoidHNjaGF1YiIsImEiOiI2TndKSnNjIn0.3Sc9yGKMUweACk0iG6HUbg';

var map = new mapboxgl.Map({
  container: 'map',
  style: {
    version: 8,
    name: 'Planet Map',
    sources: {
      base: {
        type: 'raster',
        url: 'mapbox://mapbox.satellite',
        tileSize: 256
      },
      parcels: {
        type: 'vector',
        url: 'http://localhost:3000/vector.json'
      }
    },
    layers: [{
      id: 'base',
      source: 'base',
      type: 'raster'
    }, {
      id: 'parcels-hover-fill',
      type: 'fill',
      source: 'parcels',
      'source-layer': 'parcels',
      paint: {
        'fill-color': 'rgb(0,143,213)',
        'fill-opacity': 0.6
      },
      filter: ['==', 'gid', '']
    }, {
      id: 'parcels-line',
      type: 'line',
      interactive: true,
      source: 'parcels',
      'source-layer': 'parcels',
      paint: {
        'line-color': '#DDDDDD',
        'line-width': 0.75,
        'line-opacity': 0.8
      }
    }]
  },
  hash: true,
  center: [-111.0411, 45.677],
  zoom: 14
});

map.on('click', function(event) {
  map.featuresAt(event.point, {layers: ['parcels-fill']}, function(err, features) {
    if (err) {
      throw err;
    }
    if (features.length > 0) {
      var first = features[0];
      map.setFilter('parcels-hover-fill', ['==', 'gid', first.properties.gid]);

      var popup = new mapboxgl.Popup();
      popup.setLngLat(event.lngLat);
      popup.setHTML(first.properties.ownername || 'No owner listed');
      popup.addTo(map);
    }
  });
});
