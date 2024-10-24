import express from "express";
import { refuseNotAuthed } from "../middleware/refuseNotAuthed.js";
import { registerRouter } from "./registerRouter.js";
import { loginRouter } from "./loginRouter.js";
import { profilesRouter } from "./profilesRouter.js";
import { postsRouter } from "./postsRouter.js";

const router = express.Router();

router.use("/register", registerRouter);
router.use("/login", loginRouter);
router.use("/profiles", profilesRouter);
router.use("/posts", postsRouter);
router.use("/*", (req, res, next) => {
  res.sendStatus(404);
});

export { router as baseRouter };
