import process from "node:process";
import app from "./app";
import http from "node:http";
import wsServer from "./wsServer";

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);
wsServer.start(httpServer);

httpServer.listen(PORT, () => {
  console.log(
    "Server listening on port: " +
      PORT +
      "\n\x1b[32m" +
      "http://localhost:" +
      PORT +
      "\x1b[0m"
  );
});
