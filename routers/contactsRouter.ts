import express from "express";
import contactsController from "../controllers/contactsController";

const router = express.Router();

router.get("/", contactsController.getContacts);
router.post("/:profileId", contactsController.addContact);

export { router as contactsRouter };
