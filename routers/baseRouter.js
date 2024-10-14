import express from "express";
import { registerRouter } from "./registerRouter.js";

const router = express.Router();

router.use("/register", registerRouter);
router.use("/*", (req, res, next) => {
  res.sendStatus(404);
});

export { router as baseRouter };
