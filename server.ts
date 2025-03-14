import process from "node:process";
import app from "./app.ts";
import http from "node:http";
import wsServer from "./wsServer.ts";

const PORT = process.env.PORT;
const HOSTNAME = process.env.HOSTNAME;

const httpServer = http.createServer(app);
wsServer.start(httpServer);

httpServer.listen(parseInt(PORT), HOSTNAME, () => {
  console.log(
    "Server listening on port: " +
      PORT +
      "\n\x1b[32m" +
      `http://${HOSTNAME}:` +
      PORT +
      "\x1b[0m"
  );
});
