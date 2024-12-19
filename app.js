import express from "express";
import configurePassport from "./passportConfig.js";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import getEnv from "./utils/getEnv.js";
import { baseRouter } from "./routers/baseRouter.js";

const app = express();

configurePassport();

app.use(cors({ origin: getEnv("ALLOWED_ORIGIN") }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", baseRouter);
app.use(errorHandler);

export default app;
