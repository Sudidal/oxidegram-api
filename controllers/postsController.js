import prisma from "../utils/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requiresProfile } from "../middleware/authentication.js";
import validationChains from "../validation/validationChains.js";
import validateInput from "../middleware/validateInput.js";
import prismaOptions from "../prismaOptions.js";
import multer from "multer";
import remoteStorage from "../utils/remoteStorage.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class PostsController {
  constructor() {}

  #DEFAULT_LIMIT = 10;

  async getOne(req, res, next) {
    const [post, err] = await asyncHandler.prismaQuery(() =>
      prisma.post.findUnique({
        include: prismaOptions.postIncludeOptions(req.profile?.id),
        where: {
          id: parseInt(req.params.postId),
        },
      })
    );

    if (err) {
      return next(err);
    }
    res.json({ post });
  }

  getTop = async (req, res, next) => {
    const whereClause = {};
    if (req.query.images) {
      whereClause.fileType = "IMAGE";
    }
    if (req.query.videos) {
      if (whereClause.fileType) {
        whereClause.fileType = {};
      } else {
        whereClause.fileType = "VIDEO";
      }
    }

    const [posts, err] = await asyncHandler.prismaQuery(() =>
      prisma.post.findMany({
        where: whereClause,
        include: prismaOptions.postIncludeOptions(req.profile?.id),
        orderBy: {
          likers: {
            _count: "desc",
          },
        },
        take: parseInt(req.query.limit) || this.#DEFAULT_LIMIT,
      })
    );

    if (err) {
      return next(err);
    }

    posts.forEach((post) => {
      if (post.likers.length > 0) {
        post.liked = true;
      } else {
        post.liked = false;
      }

      if (post.savers.length > 0) {
        post.saved = true;
      } else {
        post.saved = false;
      }

      post.savers = post.likers = undefined;
    });

    res.json({ posts });
  };

  post = [
    requiresProfile,
    upload.single("file"),
    (req, res, next) => {
      req.body.file = req.file;
      next();
    },
    validateInput(validationChains.postValidationChain()),
    async (req, res, next) => {
      const fileType = req.file?.mimetype.split("/");
      const uploadRes = await remoteStorage.uploadPostFile(req.file);
      if (uploadRes instanceof Error) {
        return next(uploadRes);
      }
      console.log(uploadRes);

      const [newPost, err] = await asyncHandler.prismaQuery(() =>
        prisma.post.create({
          data: {
            content: req.validatedData.content,
            publishDate: new Date().toISOString(),
            authorId: req.profile.id,
            imageUrl: uploadRes,
            fileType: fileType[0] === "image" ? "IMAGE" : "VIDEO",
          },
        })
      );

      if (!err) {
        res.json({ message: "Post created successfully" });

        const notification = await prisma.notification.create({
          data: {
            type: "POST",
            title: JSON.stringify({
              postId: newPost.id,
              authorId: newPost.authorId,
            }),
          },
        });

        const [result, err] = await asyncHandler.prismaQuery(
          () =>
            prisma.$queryRaw`SELECT push_notif_to_followers(${newPost.authorId}, ${notification.id})`
        );
        if (err) console.error(err);
      }
    },
  ];

  delete = [
    requiresProfile,
    async (req, res, next) => {
      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.post.findUnique({
          where: {
            id: parseInt(req.params.postId),
          },
        })
      );

      if (result?.authorId !== req.profile.id) {
        return res
          .status(403)
          .json({ message: "You are not allowed to do this action" });
      }

      const [deleteResult, deleteErr] = await asyncHandler.prismaQuery(() =>
        prisma.post.delete({
          where: {
            id: parseInt(req.params.postId),
          },
        })
      );

      if (deleteErr) {
        return next(err);
      }
      res.json({ message: "Post deleted successfully" });
    },
  ];

  save = [
    requiresProfile,
    async function (req, res, next) {
      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.post.update({
          where: {
            id: parseInt(req.params.postId),
          },
          data: {
            savers: {
              connect: { id: req.profile.id },
            },
          },
        })
      );
    },
  ];
  unsave = [
    requiresProfile,
    async function (req, res, next) {
      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.post.update({
          where: {
            id: parseInt(req.params.postId),
          },
          data: {
            savers: {
              disconnect: { id: req.profile.id },
            },
          },
        })
      );
    },
  ];

  like = [
    requiresProfile,
    async function (req, res, next) {
      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.post.update({
          where: {
            id: parseInt(req.params.postId),
          },
          data: {
            likers: {
              connect: { id: req.profile.id },
            },
          },
        })
      );

      if (err) {
        return next(err);
      }
      res.json({ message: "Post liked successfully" });
    },
  ];

  unlike = [
    requiresProfile,
    async function (req, res, next) {
      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.post.update({
          where: {
            id: parseInt(req.params.postId),
          },
          data: {
            likers: {
              disconnect: { id: req.profile.id },
            },
          },
        })
      );

      if (err) {
        return next(err);
      }
      res.json({ message: "Post unliked successfully" });
    },
  ];
}

const postsController = new PostsController();
export default postsController;
