import { Request, Response, NextFunction } from "express";

import database from "../storage/database";
import validateInput from "../middleware/validateInput";
import validationChains from "../validation/validationChains";
import { requiresAccount } from "../middleware/authentication";

class CommentsController {
  constructor() {}

  async getFromPost(req: Request, res: Response, next: NextFunction) {
    const queryOptions = {
      postId: parseInt(req.params.postId),
      limit: parseInt((req.query.limit as string) || ""),
      offset: parseInt((req.query.offset as string) || ""),
    };

    const [comments, err] = await database.getComments(queryOptions);

    if (err) {
      return next(err);
    }

    res.json({ comments });
  }

  post = [
    requiresAccount,
    ...validateInput(validationChains.commentValidationChain()),
    async (req: Request, res: Response, next: NextFunction) => {
      const queryOptions = {
        content: req.body.validatedData.content as string,
        publishDate: new Date(),
        authorId: req.body.profile.id as number
      };

      const [result, err] = await database.createComment(
        parseInt(req.params.postId),
        queryOptions
      );

      if (err) {
        return next(err);
      }

      res.json({ message: "Comment created successfully" });
    },
  ];
}

const commentsController = new CommentsController();
export default commentsController;
