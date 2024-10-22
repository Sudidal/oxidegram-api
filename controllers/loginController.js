import passport from "passport";

class LoginController {
  constructor() {}

  post(req, res, next) {
    passport.authenticate("local", function (err, user, info) {
      if (err || !user) {
        console.log(info);
        return res.status(401).json({ errors: info.message });
      }
      req.login(user, (err) => {
        if (err) {
          console.error(err);
        }
        res.json({ message: "Login successfull" });
      });
    })(req, res, next);
  }
}

const loginController = new LoginController();
export default loginController;
