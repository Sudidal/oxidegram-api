import prisma from "../utils/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import validateInput from "../middleware/validateInput.js";
import validationChains from "../validation/validationChains.js";

class ProfilesController {
  constructor() {}

  async getOne(req, res, next) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.profile.findMany({
        where: {
          id: req.user.id,
        },
      })
    );
    if (err) {
      return next(err);
    }

    res.json({ result });
  }

  post = [
    validateInput(validationChains.profileValidationChain()),
    async (req, res, next) => {
      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.profile.create({
          data: {
            userId: req.user.id,
            firstName: req.validatedData.firstName,
            lastName: req.validatedData.lastName,
            gender: req.validatedData.gender,
            country: req.validatedData.country,
          },
        })
      );
      if (err) {
        return next(err);
      }

      res.json({ message: "Profile created successfully" });
    },
  ];
}

const profilesController = new ProfilesController();
export default profilesController;
