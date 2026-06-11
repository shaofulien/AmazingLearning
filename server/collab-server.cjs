// Yjs collaboration relay server. Run alongside `next dev` / `next start`.
const http = require("http");
const { WebSocketServer } = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils");

const PORT = Number(process.env.COLLAB_PORT || 1234);

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("AmazingLearning collab server OK");
});

const wss = new WebSocketServer({ server });
wss.on("connection", (conn, req) => setupWSConnection(conn, req));

server.listen(PORT, () => {
  console.log(`[collab] y-websocket server listening on :${PORT}`);
});
