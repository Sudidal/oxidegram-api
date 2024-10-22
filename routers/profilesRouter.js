import express from "express";
import profilesController from "../controllers/profilesController.js";

const router = express.Router();

router.get("/:profileId", profilesController.getOne);
router.post("/", profilesController.post);

export { router as profilesRouter };
