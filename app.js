import express from "express";
import getEnv from "./utils/getEnv.js";
import errorHandler from "./middleware/errorHandler.js";
import { baseRouter } from "./routers/baseRouter.js";

const app = express();
const PORT = getEnv("PORT");

app.use("/", baseRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    "Server listening on port: " +
      PORT +
      "\n\x1b[32m" +
      "http://localhost:" +
      PORT +
      "\x1b[0m"
  );
});
