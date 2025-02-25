import type { Request, Response, NextFunction } from "express";

import process from "process";

import passport from "passport";
import jwt from "jsonwebtoken";

class LoginController {
  constructor() {}

  post(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "local",
      { session: false, failureMessage: true },
      function (err: Error, user: Express.User, info: string) {
        if (err || !user) {
          console.log(info);
          return res.status(401).json({ errors: info });
        }
        req.login(user, { session: false }, (err) => {
          if (err) {
            return next(err);
          }
          const jwtToken = jwt.sign(user, process.env.JWT_SECRET, {
            expiresIn: 60 * 60 * 24 * 4, // 4 Days
          });
          return res.json({ message: "Login successfull", jwtToken: jwtToken });
        });
        return
      }
    )(req, res, next);
  }
}

const loginController = new LoginController();
export default loginController;
