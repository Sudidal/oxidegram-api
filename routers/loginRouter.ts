import express from "express";
import loginController from "../controllers/loginController.js";

const router = express.Router();

router.post("/", loginController.post);

export { router as loginRouter };
