import express from "express";
import postsController from "../controllers/postsController.js";
import commentsController from "../controllers/commentsController.js";

const router = express.Router();

router.get("/:postId", postsController.getOne);
router.get("/:postId/comments", commentsController.getFromPost);
router.get("/", postsController.getMany);

router.post("/:postId/like", postsController.like);
router.post("/:postId/unlike", postsController.unlike);
router.post("/:postId/comments", commentsController.post);
router.post("/", postsController.post);

router.delete("/:postId", postsController.delete);

export { router as postsRouter };
