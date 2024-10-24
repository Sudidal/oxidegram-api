import express from "express";
import postsController from "../controllers/postsController.js";

const router = express.Router();

router.get("/:postId", postsController.getOne);
router.post("/", postsController.post);

export { router as postsRouter };
