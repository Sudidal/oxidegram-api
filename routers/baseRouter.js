import express from "express";
import baseController from "../controllers/indexController.js";

const router = express.Router();

router.get("/", baseController.get);

export { router as baseRouter };
