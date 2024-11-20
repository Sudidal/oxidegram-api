import prisma from "../utils/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import validateInput from "../middleware/validateInput.js";
import validationChains from "../validation/validationChains.js";
import {
  requiresAccount,
  requiresProfile,
} from "../middleware/authentication.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

class ProfilesController {
  constructor() {}

  #limit = 10;

  getMe = [
    requiresProfile,
    async (req, res, next) => {
      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.profile.findUnique({
          where: {
            id: req.profile.id,
          },
        })
      );
      if (err) {
        return next(err);
      }

      res.json({ profile: result });
    },
  ];

  getTop = async (req, res, next) => {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.profile.findMany({
        take: parseInt(req.query.limit) | this.#limit,
        orderBy: {
          followers: {
            _count: "desc",
          },
        },
      })
    );
    if (err) {
      return next(err);
    }

    res.json({ profiles: result });
  };
  async getOne(req, res, next) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.profile.findFirst({
        where: {
          id: parseInt(req.params.profileId),
        },
      })
    );
    if (err) {
      return next(err);
    }

    res.json({ profile: result });
  }

  post = [
    requiresAccount,
    upload.single("avatar"),
    validateInput(validationChains.profileValidationChain()),
    async (req, res, next) => {
      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.profile.create({
          data: {
            userId: req.user.id,
            username: req.validatedData.username,
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

  follow = [
    requiresProfile,
    async (req, res, next) => {
      const toFollowId = parseInt(req.params.profileId);
      const followerId = req.profile.id;

      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.profile.update({
          where: {
            id: followerId,
          },
          data: {
            follows: {
              set: [
                {
                  id: toFollowId,
                },
              ],
            },
          },
        })
      );

      if (err) {
        return next(err);
      }

      res.json({ message: "Followed profile successfully" });
    },
  ];
}

const profilesController = new ProfilesController();
export default profilesController;
