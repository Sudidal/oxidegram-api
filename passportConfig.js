import passport from "passport";
import localStrategy from "passport-local";
import bcrypt from "bcryptjs";
import prisma from "./utils/prisma.js";
import asyncHandler from "./utils/asyncHandler.js";

function configurePassport() {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const [user, err] = await asyncHandler.prismaQuery(
      prisma.user.findFirst({
        where: {
          id: id,
        },
      })
    );
    if (err) {
      return done(err);
    }
    done(null, user);
  });

  passport.use(
    new localStrategy(async (username, password, done) => {
      const [user, err] = await asyncHandler.prismaQuery(() =>
        prisma.user.findFirst({
          where: {
            username: username,
          },
        })
      );

      if (!user || err) {
        return done(null, false, { messages: "Username not found" });
      }
      try {
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { messages: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        done(err);
      }
    })
  );
}

export default configurePassport;
