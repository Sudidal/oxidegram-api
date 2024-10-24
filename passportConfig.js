import passport from "passport";
import bcrypt from "bcryptjs";
import asyncHandler from "./utils/asyncHandler.js";
import localStrategy from "passport-local";
import prisma from "./utils/prisma.js";
import passportJwt from "passport-jwt";
import getEnv from "./utils/getEnv.js";

function configurePassport() {
  passport.use(
    new localStrategy(async (username, password, done) => {
      const [user, err] = await asyncHandler.prismaQuery(() =>
        prisma.user.findFirst({
          where: {
            username: username,
          },
        })
      );

      if (err) {
        return done(err, false);
      }
      if (!user) {
        return done(null, false, { messages: "Username not found" });
      }

      const [match, matchErr] = await asyncHandler.handle(() =>
        bcrypt.compare(password, user.password)
      );

      if (matchErr) {
        done(err, false);
      }
      if (!match) {
        return done(null, false, { messages: "Incorrect password" });
      }

      return done(null, user);
    })
  );

  passport.use(
    new passportJwt.Strategy(
      {
        jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: getEnv("JWT_SECRET"),
      },
      (jwtPayload, done) => {
        return done(null, jwtPayload);
      }
    )
  );
}

export default configurePassport;
