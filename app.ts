import process from "process";

import express from "express";
import passport from "passport";
import configurePassport from "./passportConfig.ts";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.ts";
import getProfileOfUser from "./middleware/getProfileOfUser.ts";
import { baseRouter } from "./routers/baseRouter.ts";
import "./utils/getEnv.ts";

import { User } from "@prisma/client";

const app = express();

configurePassport();

app.use(
  cors({
    origin: [process.env.ALLOWED_ORIGIN, "https://admin.socket.io"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.locals.profile = {}
  passport.authenticate(
    "jwt",
    { session: false },
    async (_err: Error, user: User) => {
      res.locals.user = user || {};
      res.locals.profile = await getProfileOfUser(user.id) || {};
      next();
    }
  )(req, res, next);
});

app.use("/", baseRouter);
app.use(errorHandler);

export default app;
