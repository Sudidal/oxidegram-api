import express from "express";
import postsController from "../controllers/postsController.js";
import commentsController from "../controllers/commentsController.js";

const router = express.Router();

router.get("/:postId", postsController.getOne);
router.post("/", postsController.post);

router.get("/:postId/comments", commentsController.getFromPost);
router.post("/:postId/comments", commentsController.post);

export { router as postsRouter };
