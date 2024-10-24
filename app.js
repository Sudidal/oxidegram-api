import express from "express";
import getEnv from "./utils/getEnv.js";
import configurePassport from "./passportConfig.js";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import { baseRouter } from "./routers/baseRouter.js";

const app = express();
const PORT = getEnv("PORT");

configurePassport();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", baseRouter);
app.use(errorHandler);

app.startServer = () => {
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
};

export default app;
