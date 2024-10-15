import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class CustomValidators {
  constructor() {}

  async isUsernameNotUsed(value) {
    const user = await prisma.user.findFirst({
      where: {
        username: value,
      },
    });
    if (user) throw "";
    else return true;
  }
  async isEmailNotUsed(value) {
    const user = await prisma.user.findFirst({
      where: {
        email: value,
      },
    });
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
