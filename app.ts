import express from "express";
import passport from "passport";
import configurePassport from "./passportConfig.js";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import getEnv from "./utils/getEnv.js";
import getProfileOfUser from "./middleware/getProfileOfUser.js";
import { baseRouter } from "./routers/baseRouter.js";

import { User } from "@prisma/client";

const app = express();

configurePassport();

app.use(
  cors({
    origin: [getEnv("ALLOWED_ORIGIN"), "https://admin.socket.io"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err: Error, user: User, info) => {
    req.body.user = user || {};
    req.body.profile = await getProfileOfUser(user?.id) || {};
    next();
  })(req, res, next);
});

app.use("/", baseRouter);
app.use(errorHandler);

export default app;
