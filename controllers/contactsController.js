import prisma from "../utils/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requiresProfile } from "../middleware/authentication.js";

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
      const [result, err] = await asyncHandler.prismaQuery(() =>
        prisma.profile.update({
          where: {
            id: req.profile.id,
          },
          data: {
            contacts: {
              create: {
                contacted: { connect: { id: parseInt(req.params.profileId) } },
                chat: { create: {} },
              },
            },
          },
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
