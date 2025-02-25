import type { Request, Response, NextFunction } from "express";

import database from "../storage/database.ts";
import { requiresAccount } from "../middleware/authentication.ts";
import { contactExist } from "../utils/contactExist.ts";

class ContactsController {
  constructor() {}

  getContacts = [
    requiresAccount,
    async (req: Request, res: Response, next: NextFunction) => {
      const [data, err] = await database.getContacts({
        profileId: res.locals.profile.id,
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
        profileId: res.locals.profile.id,
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
