const events = require('events'),
  readTorrent = require('read-torrent'),
  engine = require('./engine');

const store = new events.EventEmitter();

const torrents = {};

store.add = function (link, callback) {
  readTorrent(link, function (err, torrent) {
    if (err) return callback(err);

    const infoHash = torrent.infoHash;
    if (torrents[infoHash]) return callback(null, infoHash);

    console.log('adding link:', infoHash);

    try {
      const e = engine(torrent, function (e) {
        torrent[infoHash] = e;
        store.emit('torrent', infoHash, e);
        callback(null, infoHash, e);
      });
    } catch (e) {
      callback(e);
    }
  });
}

store.addInfoHash = function (infoHash, callback) {
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