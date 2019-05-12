const store = require('../lib/store');

const infoHash = function (req, res, next) {
  const infoHash = req.params.infoHash;
  if (!infoHash) next();

  const ready = tor => {
    req.serializedTorrent = serialize(tor);
    req.torrent = tor;
    next();
  };

  let torrent = store.get(infoHash);
  if (!torrent) store.add(infoHash, ready);
  else ready(torrent);
}

function serialize(engine) {
  if (!engine.torrent) return { infoHash: engine.infoHash };

  const torrent = engine.torrent;
  const pieceLength = torrent.pieceLength;

  return {
    infoHash: engine.infoHash,
    name: torrent.name,
    peers: engine.swarm.wires.length,
    length: torrent.length,
    ready: engine.ready,
    files: engine.files.map(f => serializeFile(f, engine))
  }
}

function serializeFile(file, engine) {
  const { name, length, path, offset } = file;
  const infoHash = engine.infoHash;
  const pieceLength = engine.torrent.pieceLength;
  const start = offset / pieceLength || 0;
  const end = (offset + length - 1) / pieceLength || 0;
  const f = {
    name,
    length,
    path,
    link: '/torrents/' + infoHash + '/files?path=' + encodeURIComponent(path),
  };
  f.selected = isFileSelected(f, engine, start, end);
  return f;
}

function isFileSelected(file, engine, start, end) {
  return engine.selection.some(s => {
    return s.from <= start && s.to >= end;
  });
}


infoHash.serializeFile = serializeFile;
module.exports = infoHash;