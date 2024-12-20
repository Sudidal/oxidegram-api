import prisma from "../utils/prisma.js";
import { Prisma } from "@prisma/client";
import asyncHandler from "../utils/asyncHandler.js";
import prismaOptions from "../prismaOptions.js";
import { requiresProfile } from "../middleware/authentication.js";
import validateInput from "../middleware/validateInput.js";
import validationChains from "../validation/validationChains.js";
import multer from "multer";
import remoteStorage from "../utils/remoteStorage.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

  search = async (req, res, next) => {
    const [profiles, err] = await asyncHandler.prismaQuery(() =>
      prisma.profile.findMany({
        take: 10,
        where: {
          username: {
            startsWith: req.query.query,
          },
        },
        include: prismaOptions.profileIncludeOptions,
      })
    );
    if (err) {
      return next(err);
    }

    res.json({ profiles });
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
          ...prismaOptions.profileIncludeOptions(req.profile?.id),
          posts: Boolean(req.query.posts)
            ? {
                include: prismaOptions.postIncludeOptions(),
              }
            : false,
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

    result.followed = false;
    if (result.followers?.length > 0) {
      result.followed = true;
    }

    res.json({ profile: result });
  }

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
  unfollow = [
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
              disconnect: {
                id: toFollowId,
              },
            },
          },
        })
      );

      if (err) {
        return next(err);
      }

      res.json({ message: "Unfollowed profile successfully" });
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

  put = [
    requiresProfile,
    upload.single("avatar"),
    (req, res, next) => {
      req.body.file = req.file;
      next();
    },
    validateInput(validationChains.profileValidationChain(true)),
    async (req, res, next) => {
      let uploadRes = null;
      if (req.body.file) {
        uploadRes = await remoteStorage.uploadPostFile(req.body.file);
      }
      console.log(uploadRes);
      if (uploadRes instanceof Error) {
        return next(uploadRes);
      }

      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.profile.update({
          where: {
            id: req.profile.id,
          },
          data: {
            username: req.validatedData.username,
            fullName: req.validatedData.fullName,
            bio: req.validatedData.bio ?? "",
            country: req.validatedData.country ?? "",
            gender: req.validatedData.gender ?? Prisma.skip,
            websiteUrl: req.validatedData.websiteUrl ?? "",
            avatarUrl: uploadRes ?? Prisma.skip,
          },
        })
      );

      if (err) {
        return next(err);
      }

      res.json({ message: "Profile updated successfully" });
    },
  ];
}

const profilesController = new ProfilesController();
export default profilesController;
