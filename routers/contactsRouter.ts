import express from "express";
import contactsController from "../controllers/contactsController.ts";

const router = express.Router();

router.get("/", contactsController.getContacts);
router.post("/:profileId", contactsController.addContact);

export { router as contactsRouter };
