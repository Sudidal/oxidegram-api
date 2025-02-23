import type { Request, Response, NextFunction } from "express";

import database from "../storage/database";
import asyncHandler from "../utils/asyncHandler";
import bcrypt from "bcryptjs";
import validateInput from "../middleware/validateInput";
import validationChains from "../validation/validationChains";

class RegisterController {
  constructor() {}

  post = [
    ...validateInput(validationChains.registerValidationChain()),
    ...validateInput(validationChains.profileValidationChain()),
    async (req: Request, res: Response, next: NextFunction) => {
      const [hashedPassword, hashErr] = await asyncHandler.handle(() =>
        bcrypt.hash(req.body.validatedData.password, 10)
      );

      if (hashErr || ! hashedPassword) {
        return next(hashErr);
      }

      const queryOptions = {
        email: req.body.validatedData.email,
        password: hashedPassword,
        username: req.body.validatedData.username,
        fullName: req.body.validatedData.fullName,
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
