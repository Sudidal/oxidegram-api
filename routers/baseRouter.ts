import express from "express";
import { registerRouter } from "./registerRouter.js";
import { loginRouter } from "./loginRouter.js";
import { profilesRouter } from "./profilesRouter.js";
import { postsRouter } from "./postsRouter.js";
import { contactsRouter } from "./contactsRouter.js";

const router = express.Router();

router.use("/register", registerRouter);
router.use("/login", loginRouter);
router.use("/profiles", profilesRouter);
router.use("/posts", postsRouter);
router.use("/contacts", contactsRouter);
router.use("/*", (req, res, next) => {
  res.sendStatus(404);
});

export { router as baseRouter };
