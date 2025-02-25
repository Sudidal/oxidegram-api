import express from "express";
import registerController from "../controllers/registerController.ts";

const router = express.Router();

router.post("/", registerController.post);

export { router as registerRouter };
