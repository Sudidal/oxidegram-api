import process from "process";

import express from "express";
import passport from "passport";
import configurePassport from "./passportConfig";
import cors from "cors";
import errorHandler from "./middleware/errorHandler";
import getProfileOfUser from "./middleware/getProfileOfUser";
import { baseRouter } from "./routers/baseRouter";

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
  req.body.profile = {}
  passport.authenticate(
    "jwt",
    { session: false },
    async (err: Error, user: User, info: string) => {
      req.body.user = user || {};
      req.body.profile = await getProfileOfUser(user.id) || {};
      console.log(req.body.profile)
      next();
    }
  )(req, res, next);
});

app.use("/", baseRouter);
app.use(errorHandler);

export default app;
