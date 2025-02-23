import express from "express";
import { registerRouter } from "./registerRouter";
import { loginRouter } from "./loginRouter";
import { profilesRouter } from "./profilesRouter";
import { postsRouter } from "./postsRouter";
import { contactsRouter } from "./contactsRouter";

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
