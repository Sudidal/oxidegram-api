import passport from "passport";

class LoginController {
  constructor() {}

  post = [
    passport.authenticate("local", { failureMessage: true }),
    (req, res) => {
      res.json({ message: "Login successfull" });
    },
  ];
}

const loginController = new LoginController();
export default loginController;
