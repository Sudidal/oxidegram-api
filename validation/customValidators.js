import prisma from "../utils/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";

class CustomValidators {
  constructor() {}

  async isUsernameNotUsed(value) {
    const [user, err] = await asyncHandler.prismaQuery(() =>
      prisma.user.findFirst({
        where: {
          username: value,
        },
      })
    );
    if (user) throw "";
    else return true;
  }
  async isEmailNotUsed(value) {
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
  isPasswordsMatch(value, { req }) {
    if (req.body.password === req.body.confirm_password) return true;
    else return false;
  }
}

const customValidators = new CustomValidators();
export default customValidators;
