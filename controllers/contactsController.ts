import type { Request, Response, NextFunction } from "express";

import database from "../storage/database";
import { requiresAccount } from "../middleware/authentication";
import { contactExist } from "../utils/contactExist";

class ContactsController {
  constructor() {}

  getContacts = [
    requiresAccount,
    async (req: Request, res: Response, next: NextFunction) => {
      const [data, err] = await database.getContacts({
        profileId: req.body.profile.id,
      });

      if (err) {
        return next(err);
      }

      res.json(data);
    },
  ];

  addContact = [
    requiresAccount,
    async (req: Request, res: Response, next: NextFunction) => {
      const queryOptions = {
        profileId: req.body.profile.id,
        contactedId: parseInt(req.params.profileId),
      };

      const exists = await contactExist(
        queryOptions.profileId,
        queryOptions.contactedId
      );

      if (exists) {
        return res.json({ message: "Contact already exist" });
      }

      const [result, err] = await database.createContact(queryOptions);

      if (err) {
        return next(err);
      }

      res.json({ message: "Added contact successfully" });
    },
  ];
}

const contactsController = new ContactsController();
export default contactsController;
