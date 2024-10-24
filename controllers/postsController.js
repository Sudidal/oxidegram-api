import prisma from "../utils/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requiresProfile } from "../middleware/authentication.js";
import validationChains from "../validation/validationChains.js";
import validateInput from "../middleware/validateInput.js";

class PostsController {
  constructor() {}

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

  post = [
    requiresProfile,
    validateInput(validationChains.postValidationChain()),
    async (req, res, next) => {
      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.post.create({
          data: {
            content: req.validatedData.content,
            publishDate: new Date().toISOString(),
            authorId: req.profile.id,
          },
        })
      );

      if (!err) {
        res.json({ message: "Post created successfully" });
      }
    },
  ];
}

const postsController = new PostsController();
export default postsController;
