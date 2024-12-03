import express from "express";
import profilesController from "../controllers/profilesController.js";

const router = express.Router();

router.get("/me", profilesController.getMe);
router.get("/top", profilesController.getTop);
router.get("/:profileId", profilesController.getOne);
router.get("/details/:profileId", profilesController.getDetailsOfOne);
router.post("/", profilesController.post);
router.post("/savepost/:postId", profilesController.savePost);
router.put("/follow/:profileId", profilesController.follow);

export { router as profilesRouter };
