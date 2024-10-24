import passport from "passport";
import jwt from "jsonwebtoken";
import getEnv from "../utils/getEnv.js";

class LoginController {
  constructor() {}

  post(req, res, next) {
    passport.authenticate(
      "local",
      { session: false },
      function (err, user, info) {
        if (err || !user) {
          console.log(info);
          return res.status(401).json({ errors: info.message });
        }
        req.login(user, { session: false }, (err) => {
          if (err) {
            next(err);
          }
          const jwtToken = jwt.sign(user, getEnv("JWT_SECRET"), {
            expiresIn: 60 * 60 * 24 * 4, // 4 Days
          });
          res.json({ message: "Login successfull", jwtToken: jwtToken });
        });
      }
    )(req, res, next);
  }
}

const loginController = new LoginController();
export default loginController;
