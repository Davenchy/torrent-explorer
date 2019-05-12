const events = require('events'),
  readTorrent = require('read-torrent'),
  engine = require('./engine');

const store = new events.EventEmitter();

const torrents = {};

store.add = function (infoHash, callback) {
  console.log('adding info hash:', infoHash);
  engine(`magnet:?xt=urn:btih:${infoHash}`, function (e) {
    torrents[infoHash] = e;
    store.emit('torrent', infoHash, e);
    callback(e);
  });
}

store.get = function (infoHash) {
  return torrents[infoHash];
}

module.exports = store;