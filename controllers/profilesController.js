import prisma from "../utils/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import validateInput from "../middleware/validateInput.js";
import validationChains from "../validation/validationChains.js";
import {
  requiresAccount,
  requiresProfile,
} from "../middleware/authentication.js";
import multer from "multer";
import remoteStorage from "../utils/remoteStorage.js";

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
  async getDetailsOfOne(req, res, next) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.profile.findFirst({
        where: {
          id: parseInt(req.params.profileId),
        },
        select: {
          posts: Boolean(req.query.posts),
          follows: Boolean(req.query.follows),
          followers: Boolean(req.query.followers),
          savedPosts: Boolean(req.query.savedPosts),
          contacts: Boolean(req.query.contacts)
            ? {
                include: {
                  contacted: true,
                  chat: {
                    include: {
                      messages: true,
                    },
                  },
                },
              }
            : false,
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
    // validateInput(validationChains.profileValidationChain()),
    async (req, res, next) => {
      const uploadRes = await remoteStorage.uploadAvatarImage(req.file);
      if (uploadRes instanceof Error) {
        return next(uploadRes);
      }

      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.profile.create({
          data: {
            userId: req.user.id,
            username: req.validatedData.username,
            fullName: req.validatedData.fullName,
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

  savePost = [
    requiresProfile,
    async (req, res, next) => {
      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.profile.update({
          where: {
            id: parseInt(req.profile.id),
          },
          data: {
            savedPosts: {
              connect: {
                id: parseInt(req.params.postId),
              },
            },
          },
        })
      );
      if (err) {
        return next(err);
      }
      res.json({ message: "Saved post successfully" });
    },
  ];
}

const profilesController = new ProfilesController();
export default profilesController;
