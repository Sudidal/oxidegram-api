import { PrismaClient } from "@prisma/client";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

class RegisterController {
  constructor() {}

  async post(req, res, next) {
    const [hashedPassword, hashErr] = await asyncHandler.handle(() =>
      bcrypt.hash(req.body.password, 10)
    );
    if (hashErr) {
      return next(hashErr);
    }
    const [result, err] = await asyncHandler.prismaQuery(
      () =>
        prisma.user.create({
          data: {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
          },
        }),
      next
    );

    if (!err) {
      res.json({ message: "Account registered successfully" });
    }
  }
}

const registerController = new RegisterController();
export default registerController;
