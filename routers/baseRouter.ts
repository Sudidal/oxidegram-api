import express from "express";
import { registerRouter } from "./registerRouter.ts";
import { loginRouter } from "./loginRouter.ts";
import { profilesRouter } from "./profilesRouter.ts";
import { postsRouter } from "./postsRouter.ts";
import { contactsRouter } from "./contactsRouter.ts";

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
