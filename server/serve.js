'use strict'

const SphericalMercator = require('sphericalmercator');
const fs = require('fs');
const http = require('http');
const mapnik = require('mapnik');
const tiles = require('./tiles.json');
const url = require('url');

mapnik.register_default_input_plugins();

const size = 256;
const merc = new SphericalMercator({size: size});

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
  new mapnik.Map(size, size).load('./config.xml', (err, map) => {
    if (err) {
      return callback(err);
    }

    map.extent = merc.bbox(x, y, z, false, '900913');
    if (type === 'pbf') {
      renderVector(map, x, y, z, callback);
    } else {
      renderRaster(map, callback);
    }
  });
}

function handler(request, response) {
  const parts = url.parse(request.url).path.split('/');
  if (parts.length !== 4) {
    var json = JSON.stringify(tiles);
    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Content-Length': json.length
    });
    response.write(json);
    return response.end();
  }
  const z = Number(parts[1]);
  const x = Number(parts[2]);
  const last = parts[3].split('.')
  const y = Number(last.shift());
  const type = last.pop();
  if (isNaN(z) || isNaN(x) || isNaN(y)) {
    response.writeHead(400);
    return response.end('Bad request\n');
  }
  render(x, y, z, type, (err, buffer) => {
    if (err) {
      process.stderr.write(`Rendering failed for [${x}, ${y}, ${z}]: ${err.message}\n`);
      response.writeHead(500);
      return response.end();
    }
    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': type === 'pbf' ? 'application/x-protobuf': 'image/png',
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
