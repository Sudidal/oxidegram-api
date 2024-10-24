import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../utils/prisma.js";
import validateInput from "../middleware/validateInput.js";
import validationChains from "../validation/validationChains.js";
import { requiresProfile } from "../middleware/authentication.js";

class CommentsController {
  constructor() {}

  async getFromPost(req, res, next) {
    const [comments, err] = await asyncHandler.prismaQuery(
      () =>
        prisma.comment.findMany({
          where: {
            postId: parseInt(req.params.postId),
          },
        }),
      (err) => {
        return next(err);
      }
    );

    res.json({ comments });
  }

  post = [
    requiresProfile,
    validateInput(validationChains.commentValidationChain()),
    async (req, res, next) => {
      const [result, err] = await asyncHandler.prismaQuery(
        () =>
          prisma.comment.create({
            data: {
              content: req.validatedData.content,
              publishDate: new Date().toISOString(),
              authorId: req.profile.id,
              postId: parseInt(req.params.postId),
            },
          }),
        (err) => {
          return next(err);
        }
      );

      res.json({ message: "Comment created successfully" });
    },
  ];
}

const commentsController = new CommentsController();
export default commentsController;
