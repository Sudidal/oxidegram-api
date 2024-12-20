import prisma from "../utils/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requiresProfile } from "../middleware/authentication.js";
import { contactExist } from "../utils/contactExist.js";

class ContactsController {
  constructor() {}

  getContacts = [
    requiresProfile,
    async (req, res, next) => {
      const [data, err] = await asyncHandler.prismaQuery(() =>
        prisma.profile.findFirst({
          where: {
            id: req.profile.id,
          },
          select: {
            contacts: {
              select: {
                contacted: true,
              },
            },
          },
        })
      );

      if (err) {
        return next(err);
      }
      res.json(data);
    },
  ];

  addContact = [
    requiresProfile,
    async (req, res, next) => {
      const profileId = req.profile.id;
      const contactedId = parseInt(req.params.profileId);

      if (await contactExist(profileId, contactedId)) {
        return res.json({ message: "Contact already exist" });
      }

      const [chatResult, chatErr] = await asyncHandler.prismaQuery(() =>
        prisma.chat.create()
      );

      if (chatErr) {
        return next(chatErr);
      }

      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.contact.createMany({
          data: [
            {
              profileId: profileId,
              contactedId: contactedId,
              chatId: chatResult.id,
            },
            {
              profileId: contactedId,
              contactedId: profileId,
              chatId: chatResult.id,
            },
          ],
        })
      );

      if (err) {
        return next(err);
      }
      res.json({ message: "Added contact successfully" });
    },
  ];
}

const contactsController = new ContactsController();
export default contactsController;
