import type { Request, Response } from "express";
import type { Meta } from "express-validator";

import prisma from "../utils/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";

class CustomValidators {
  constructor() {}

  async isUsernameNotUsed(value: string) {
    const [user, err] = await asyncHandler.prismaQuery(() =>
      prisma.profile.findFirst({
        where: {
          username: value,
        },
      })
    );
    if (user) throw "";
    else return true;
  }
  async isEmailNotUsed(value: string) {
    const [user, err] = await asyncHandler.prismaQuery(() =>
      prisma.user.findFirst({
        where: {
          email: value,
        },
      })
    );
    if (user) throw "";
    else return true;
  }
  isPasswordsMatch(value: string, { req }: Meta) {
    if (req.body.password === req.body.confirmPassword) return true;
    else return false;
  }
}

const customValidators = new CustomValidators();
export default customValidators;
