import database from "../storage/database.js";
import validateInput from "../middleware/validateInput.js";
import validationChains from "../validation/validationChains.js";
import { requiresAccount } from "../middleware/authentication.js";

class CommentsController {
  constructor() {}

  async getFromPost(req, res, next) {
    const queryOptions = {
      postId: parseInt(req.params.postId),
      limit: parseInt(req.query.limit),
      offset: parseInt(req.query.offset),
    };

    const [comments, err] = await database.getComments(
      req.profile.id,
      queryOptions
    );

    res.json({ comments });
  }

  post = [
    requiresAccount,
    validateInput(validationChains.commentValidationChain()),
    async (req, res, next) => {
      const queryOptions = {
        content: req.validatedData.content,
        publishDate: new Date().toISOString(),
        authorId: req.profile.id,
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
