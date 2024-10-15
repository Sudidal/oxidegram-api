import express from "express";
import { registerRouter } from "./registerRouter.js";
import { loginRouter } from "./loginRouter.js";

const router = express.Router();

router.use("/register", registerRouter);
router.use("/login", loginRouter);
router.use("/*", (req, res, next) => {
  res.sendStatus(404);
});

export { router as baseRouter };
