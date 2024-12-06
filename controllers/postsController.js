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
    const [posts, err] = await asyncHandler.prismaQuery(() =>
      prisma.post.findMany({
        include: prismaOptions.postIncludeOptions,
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
    res.json({ posts });
  };

  post = [
    requiresProfile,
    upload.single("image"),
    validateInput(validationChains.postValidationChain()),
    async (req, res, next) => {
      const uploadRes = await remoteStorage.uploadPostImage(req.file);
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
}

const postsController = new PostsController();
export default postsController;
