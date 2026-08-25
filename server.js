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
// Mounted at root with pathFilter so request paths pass through UNCHANGED —
// PeerJS expects its own '/peerjs/...' prefix intact. v4 of http-proxy-middleware
// uses 'pathFilter' and requires manual forwarding of websocket upgrades.
const peerProxy = createProxyMiddleware({
  pathFilter: '/peerjs',
  target: `http://127.0.0.1:${PEER_PORT}`,
  ws: true,
  changeOrigin: true,
});
app.use(peerProxy);

// serve the game (after proxy so /peerjs always wins)
app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Neon City Strike running on port ${PORT}`);
  console.log(`PeerJS signalling proxied at /peerjs -> ${PEER_PORT}`);
});
server.on('upgrade', peerProxy.upgrade);
