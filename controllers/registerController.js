import { PrismaClient } from "@prisma/client";
import asyncHandler from "../utils/asyncHandler.js";

const prisma = new PrismaClient();

class RegisterController {
  constructor() {}

  async post(req, res, next) {
    const [result, err] = await asyncHandler.prismaQuery(
      () =>
        prisma.user.create({
          data: {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
          },
        }),
      next
    );

    if (!err) {
      res.json({ message: "Post added successfully" });
    }
  }
}

const registerController = new RegisterController();
export default registerController;
