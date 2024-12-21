import database from "../storage/database.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";
import validateInput from "../middleware/validateInput.js";
import validationChains from "../validation/validationChains.js";

class RegisterController {
  constructor() {}

  post = [
    validateInput(validationChains.registerValidationChain()),
    validateInput(validationChains.profileValidationChain()),
    async (req, res, next) => {
      const [hashedPassword, hashErr] = await asyncHandler.handle(() =>
        bcrypt.hash(req.validatedData.password, 10)
      );

      if (hashErr) {
        return next(hashErr);
      }

      const queryOptions = {
        email: req.validatedData.email,
        password: hashedPassword,
        username: req.validatedData.username,
        fullName: req.validatedData.fullName,
      };

      const [result, err] = await database.createAccount(queryOptions);

      if (err) {
        return next(err);
      }

      res.json({ message: "Created account and profile successfully" });
    },
  ];
}

const registerController = new RegisterController();
export default registerController;
