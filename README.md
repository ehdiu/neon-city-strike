# NEON CITY STRIKE

Cyberpunk arena FPS (single-file Three.js) with P2P multiplayer via WebRTC.

## Deploy on Railway (via GitHub)

1. Push this folder to a GitHub repository.
2. On [railway.com](https://railway.com): **New Project → Deploy from GitHub repo** → pick the repo.
3. Railway auto-detects Node (`npm start`). No env vars required.
4. Open the deployed URL — done. Share the link; multiplayer works across networks.

## How it works

- `public/index.html` — the entire game
- `server.js` — serves the game + self-hosted PeerJS signalling at `/peerjs`
- Player-to-player game data is pure P2P (WebRTC); the server only introduces peers
- STUN (Google/Twilio) + TURN relay fallback are configured in the client,
  so players on different networks/carriers can always connect

## Local run

```bash
npm install
npm start
# open http://localhost:3000
```
