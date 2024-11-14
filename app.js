import express from "express";
import configurePassport from "./passportConfig.js";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import { baseRouter } from "./routers/baseRouter.js";

const app = express();

configurePassport();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", baseRouter);
app.use(errorHandler);

export default app;
