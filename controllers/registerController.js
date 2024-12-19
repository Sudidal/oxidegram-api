import prisma from "../utils/prisma.js";
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
      const [result, err] = await asyncHandler.prismaQuery(
        () =>
          prisma.user.create({
            data: {
              email: req.validatedData.email,
              password: hashedPassword,
              profile: {
                create: {
                  username: req.validatedData.username,
                  fullName: req.validatedData.fullName,
                },
              },
            },
          }),
        next
      );

      if (!err) {
        res.json({ message: "Created account and profile successfully" });
      }
    },
  ];
}

const registerController = new RegisterController();
export default registerController;
