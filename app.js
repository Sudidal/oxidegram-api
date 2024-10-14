import express from "express";
import session from "express-session";
import getEnv from "./utils/getEnv.js";
import configurePassport from "./passportConfig.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import errorHandler from "./middleware/errorHandler.js";
import { baseRouter } from "./routers/baseRouter.js";

const app = express();
const PORT = getEnv("PORT");

configurePassport();

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    cookie: {
      maxAge: 4 * 24 * 60 * 60 * 1000, //4 days
    },
    secret: getEnv("SESSION_SECRET"),
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

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
