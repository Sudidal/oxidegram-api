import prisma from "./utils/prisma.js";
import asyncHandler from "./utils/asyncHandler.js";
import { Server } from "socket.io";
import passport from "passport";
import getProfileOfUser from "./middleware/getProfileOfUser.js";

function startWSServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: ["http://127.0.0.1:5500"] },
    path: "/direct",
  });

  io.engine.use(passport.authenticate("jwt", { session: false }));
  io.engine.use(async (req, res, next) => {
    const profile = await getProfileOfUser(req.user.id);

    if (!profile) {
      return res
        .status(403)
        .json({ message: "No profile associated with this account" });
    } else {
      req.profile = profile;
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log("connection");

    socket.on("chat msg", (msg, contactId) => {
      handleMessage(socket, msg, contactId);
    });
  });
}

async function handleMessage(socket, msg, contactId) {
  const [result, err] = await asyncHandler.prismaQuery(() =>
    prisma.contact.update({
      where: {
        id: contactId,
      },
      data: {
        chat: {
          update: {
            messages: {
              create: {
                sender: {
                  connect: { id: socket.request.profile.id },
                },
                content: msg,
                sendDate: new Date().toISOString(),
              },
            },
          },
        },
      },
    })
  );
}

export default startWSServer;
