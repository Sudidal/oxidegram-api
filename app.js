import express from "express";
import passport from "passport";
import configurePassport from "./passportConfig.js";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import getEnv from "./utils/getEnv.js";
import getProfileOfUser from "./middleware/getProfileOfUser.js";
import { baseRouter } from "./routers/baseRouter.js";

const app = express();

configurePassport();

app.use(cors({ origin: getEnv("ALLOWED_ORIGIN") }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    req.user = user;
    req.profile = await getProfileOfUser(user?.id);
    next();
  })(req, res, next);
});

app.use("/", baseRouter);
app.use(errorHandler);

export default app;
