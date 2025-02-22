import express from "express";
import profilesController from "../controllers/profilesController.js";

const router = express.Router();

router.get("/me", profilesController.getMe);
router.get("/search", profilesController.search);
router.get("/details/:profileId", profilesController.getDetailsOfOne);
router.get("/:profileId", profilesController.getOne);
router.get("/", profilesController.getMany);

router.post("/savepost/:postId", profilesController.savePost);
router.post("/unsavepost/:postId", profilesController.unsavePost);
router.post("/follow/:profileId", profilesController.follow);
router.post("/unfollow/:profileId", profilesController.unfollow);

router.put("/update", profilesController.put);

export { router as profilesRouter };
