const express = require('express'),
  store = require('./lib/store'),
  rangeParser = require('range-parser'),
  infoHashUtil = require('./middleware/infoHashUtil'),
  pump = require('pump'),
  fs = require('fs'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  morgan = require('morgan'),
  app = express(),
  PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(cors());

// get torrent files
app.get('/torrents/:infoHash', infoHashUtil, (req, res) => {
  res.send(req.serializedTorrent);
});

// get torrent file
app.get('/torrents/:infoHash/files', infoHashUtil, (req, res) => {
  const { path } = req.query;
  const torrent = req.torrent, file = torrent.files.find(f => f.path === path);

  if (!file) return res.sendStatus(404);

  file.select();

  var range = req.headers.range;
  range = range && rangeParser(file.length, range)[0];
  res.setHeader('Accept-Ranges', 'bytes');
  res.type(file.name);
  req.connection.setTimeout(3600000);

  if (!range) {
    res.setHeader('Content-Length', file.length);
  } else {
    res.statusCode = 206;
    res.setHeader('Content-Length', range.end - range.start + 1);
    res.setHeader('Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + file.length);
  }

  if (req.method === 'HEAD') return res.end();
  pump(file.createReadStream(range), res);
});

app.listen(PORT, () => console.log('listening on port', PORT));