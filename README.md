# Torrent Explorer

- Torrent explorer and streamer
- The full project from [here](https://github.com/asapach/peerflix-server)

## How to use

```bash

# to run the server
npm start

# clean the torrent temp dir
npm run clean

```

## HTTP API

Method | End Point | Desc
-------|-----------|------
GET | /torrents/:infoHash | torrent files list
GET | /torrents/:infoHash/files?path | file streaming