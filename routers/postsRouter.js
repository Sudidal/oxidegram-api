import express from "express";
import postsController from "../controllers/postsController.js";
import commentsController from "../controllers/commentsController.js";

const router = express.Router();

router.get("/top", postsController.getTop);
router.get("/:postId", postsController.getOne);

router.post("/:postId/like", postsController.like);
router.post("/:postId/unlike", postsController.unlike);
router.post("/:postId/save", postsController.save);
router.post("/:postId/unsave", postsController.unsave);

router.get("/:postId/comments", commentsController.getFromPost);
router.post("/:postId/comments", commentsController.post);

router.delete("/:postId", postsController.delete);

router.post("/", postsController.post);

export { router as postsRouter };
