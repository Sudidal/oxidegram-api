import database from "../storage/database.js";
import { requiresProfile } from "../middleware/authentication.js";
import { contactExist } from "../utils/contactExist.js";

class ContactsController {
  constructor() {}

  getContacts = [
    requiresProfile,
    async (req, res, next) => {
      const [data, err] = await database.getContacts({
        profileId: req.profile.id,
      });

      if (err) {
        return next(err);
      }
      res.json(data);
    },
  ];

  addContact = [
    requiresProfile,
    async (req, res, next) => {
      const queryOptions = {
        profileId: req.profile.id,
        contactedId: parseInt(req.params.profileId),
      };

      const exists = await contactExist(
        queryOptions.profileId,
        queryOptions.contactedId
      );

      console.log(exists);

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
