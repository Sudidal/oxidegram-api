import process from "process";

import passport from "passport";
import bcrypt from "bcryptjs";
import localStrategy from "passport-local";
import passportJwt from "passport-jwt";

import asyncHandler from "./utils/asyncHandler";
import prisma from "./utils/prisma";

function configurePassport() {
  passport.use(
    new localStrategy.Strategy(
      { usernameField: "email" },
      async (email, password, done) => {
        const [user, err] = await asyncHandler.prismaQuery(() =>
          prisma.user.findFirst({
            where: {
              email: email,
            },
            select: {
              password: false
            }
          })
        );

        if (err) {
          return done(err, false);
        }
        if (!user) {
          return done(null, false, { message: "E-mail not found" });
        }

        const [match, matchErr] = await asyncHandler.handle(() =>
          bcrypt.compare(password, user.password)
        );

        if (matchErr) {
          done(err, false);
        }
        if (!match) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      }
    )
  );

  passport.use(
    new passportJwt.Strategy(
      {
        jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      (jwtPayload, done) => {
        return done(null, jwtPayload);
      }
    )
  );
}

export default configurePassport;
