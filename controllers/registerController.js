import { PrismaClient } from "@prisma/client";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";
import validateInput from "../middleware/validateInput.js";
import validationChains from "../validation/validationChains.js";

const prisma = new PrismaClient();

class RegisterController {
  constructor() {}

  post = [
    validateInput(validationChains.registerValidationChain()),
    async (req, res, next) => {
      const [hashedPassword, hashErr] = await asyncHandler.handle(() =>
        bcrypt.hash(req.body.validatedData.password, 10)
      );
      if (hashErr) {
        return next(hashErr);
      }
      const [result, err] = await asyncHandler.prismaQuery(
        () =>
          prisma.user.create({
            data: {
              username: req.body.validatedData.username,
              email: req.body.validatedData.email,
              password: hashedPassword,
            },
          }),
        next
      );

      if (!err) {
        res.json({ message: "Account registered successfully" });
      }
    },
  ];
}

const registerController = new RegisterController();
export default registerController;
