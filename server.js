import app from "./app.js";
import http from "node:http";
import getEnv from "./utils/getEnv.js";
import startWSServer from "./wsServer.js";

const PORT = getEnv("PORT");

const httpServer = http.createServer(app);
startWSServer(httpServer);

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
