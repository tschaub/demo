'use strict'

const SphericalMercator = require('sphericalmercator');
const fs = require('fs');
const http = require('http');
const mapnik = require('mapnik');
const path = require('path');
const url = require('url');

const metadata = {
  'raster.json': require('./raster.json'),
  'vector.json': require('./vector.json')
};

mapnik.register_default_input_plugins();

const size = 256;
const merc = new SphericalMercator({size: size});

function renderJson(map, jsonp, callback) {
  const grid = new mapnik.Grid(size, size);
  const options = {
    layer: 0,
    fields: ['parcelid', 'ownername', 'totalacres']
  }
  map.render(grid, options, (err, grid) => {
    if (err) {
      return callback(err);
    }
    grid.encode({resolution: 4}, (err, json) => {
      if (err) {
        return callback(err);
      }
      let data = JSON.stringify(json, null, 2);
      if (jsonp) {
        data = `${jsonp}(${data})`
      }
      callback(null, data);
    });
  });
}

function renderRaster(map, callback) {
  const image = new mapnik.Image(size, size);
  map.render(image, (err, image) => {
    if (err) {
      return callback(err);
    }
    image.encode('png', callback);
  });
}

function renderVector(map, x, y, z, callback) {
  const vtile = new mapnik.VectorTile(z, x, y);
  map.render(vtile, (err, vtile) => {
    if (err) {
      return callback(err);
    }
    callback(null, vtile.getData());
  });
}

function render(x, y, z, type, callback) {
  const config = path.join(__dirname, 'config.xml');
  new mapnik.Map(size, size).load(config, (err, map) => {
    if (err) {
      return callback(err);
    }

    map.extent = merc.bbox(x, y, z, false, '900913');
    if (type === 'pbf') {
      renderVector(map, x, y, z, callback);
    } else if (type.indexOf('json') === 0) {
      const jsonp = type.replace(/^json\:/, '');
      renderJson(map, jsonp, callback);
    } else {
      renderRaster(map, callback);
    }
  });
}

function getContentType(type) {
  if (type === 'pbf') {
    return 'application/x-protobuf';
  } else if (type === 'json') {
    return 'application/json';
  } else if (type.indexOf('json') === 0) {
    return 'application/javascript';
  } else {
    return 'image/png'
  }
}

function handler(request, response) {
  const parsed = url.parse(request.url, true);
  const parts = parsed.pathname.split('/');
  if (parts.length !== 4) {
    var data = metadata[parts[1]];
    if (!data) {
      response.writeHead(400, {
        'Access-Control-Allow-Origin': '*'
      });
      return response.end();
    }
    var content = JSON.stringify(data);
    var contentType = 'application/json';
    if (parsed.query.callback) {
      content = `${parsed.query.callback}(${content})`;
      contentType = 'application/javascript';
    }
    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': contentType,
      'Content-Length': content.length
    });
    response.write(content);
    return response.end();
  }
  const z = Number(parts[1]);
  const x = Number(parts[2]);
  const last = parts[3].split('.')
  const y = Number(last.shift());
  let type = last.pop();
  if (parsed.query.callback) {
    type = `${type}:${parsed.query.callback}`;
  }
  if (isNaN(z) || isNaN(x) || isNaN(y)) {
    response.writeHead(400, {
      'Access-Control-Allow-Origin': '*'
    });
    return response.end('Bad request\n');
  }
  render(x, y, z, type, (err, buffer) => {
    if (err) {
      process.stderr.write(`Rendering failed for [${x}, ${y}, ${z}]: ${err.message}\n`);
      response.writeHead(500, {
        'Access-Control-Allow-Origin': '*'
      });
      return response.end();
    }
    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': getContentType(type),
      'Content-Length': buffer.length
    });
    response.write(buffer);
    response.end();
  });
}

const server = http.createServer(handler);
server.listen(3000, () => {
  console.log(`Listening on http://localhost:${server.address().port}/`);
});
