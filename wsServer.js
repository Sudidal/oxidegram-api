import prisma from "./utils/prisma.js";
import asyncHandler from "./utils/asyncHandler.js";
import { Server } from "socket.io";
import passport from "passport";
import getProfileOfUser from "./middleware/getProfileOfUser.js";
import getEnv from "./utils/getEnv.js";

function startWSServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: [getEnv("WS_ALLOWED_ORIGIN")] },
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
    console.log("WS connection");

    socket.auth = { profileId: socket.request.profile.id };

    socket.on("chat msg", (msg, contactId, recieverId) => {
      handleMessage(io, socket, msg, contactId, recieverId);
    });
  });
}

async function handleMessage(io, socket, msg, chatId, receiverId) {
  const [result, err] = await asyncHandler.prismaQuery(() =>
    prisma.message.create({
      data: {
        content: msg,
        sendDate: new Date().toISOString(),
        sender: {
          connect: { id: socket.request.profile.id },
        },
        chat: {
          connect: { id: chatId },
        },
      },
    })
  );

  const targetSocket = await getSocketFromProfileId(io, receiverId);

  io.to([targetSocket.id, socket.id]).emit("chat msg", result);
}

async function getSocketFromProfileId(io, profileId) {
  const allSockets = await io.fetchSockets();

  for (let i = 0; i < allSockets.length; i++) {
    if (allSockets[i].auth.profileId === profileId) {
      return allSockets[i];
    }
  }
}

export default startWSServer;
