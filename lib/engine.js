const torrentStream = require('torrent-stream'),
  trackers = require('./trackers'),
  path = require('path');

const options = {
  trackers,
  tmp: path.resolve(__dirname, '..', 'temp')
};

module.exports = function (torrent, callback = () => { }) {
  const engine = torrentStream(torrent, options);

  engine.on('destroyed', engine.removeAllListeners);
  engine.on('error', e => console.log('error ' + engine.infoHash + ': ' + e));
  engine.on('ready', function () {
    console.log('ready ' + engine.infoHash);
    engine.ready = true;
    callback(engine);
  });

  return engine;
};