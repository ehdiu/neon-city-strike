const express = require('express');
const { PeerServer } = require('peer');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PEER_PORT = process.env.PEER_PORT || 9000;

// simple health endpoint for Railway checks
app.get('/healthz', (req, res) => res.json({ ok: true, game: 'neon-city-strike' }));

// self-hosted PeerJS signalling server on an internal port.
// Rooms are just peer IDs; the game client prefixes them with 'ncs-v2-'.
PeerServer({
  port: PEER_PORT,
  path: '/peerjs',
  allow_discovery: false,
});

// Proxy /peerjs/* (HTTP + websocket upgrade) to the internal signalling server.
// Mounted AT /peerjs so only signalling traffic is proxied and static files still work.
const peerProxy = createProxyMiddleware({
  target: `http://127.0.0.1:${PEER_PORT}`,
  ws: true,
  changeOrigin: false, // path prefix must pass through unchanged for PeerJS
});
app.use('/peerjs', peerProxy);

// serve the game (after proxy so /peerjs always wins)
app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Neon City Strike running on port ${PORT}`);
  console.log(`PeerJS signalling proxied at /peerjs -> ${PEER_PORT}`);
});
server.on('upgrade', peerProxy.upgrade);
