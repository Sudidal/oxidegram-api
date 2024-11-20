import express from "express";
import profilesController from "../controllers/profilesController.js";

const router = express.Router();

router.get("/me", profilesController.getMe);
router.get("/top", profilesController.getTop);
router.get("/:profileId", profilesController.getOne);
router.post("/", profilesController.post);
router.put("/follow/:profileId", profilesController.follow);

export { router as profilesRouter };
