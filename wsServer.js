import prisma from "./utils/prisma.js";
import asyncHandler from "./utils/asyncHandler.js";
import { Server } from "socket.io";
import passport from "passport";
import getProfileOfUser from "./middleware/getProfileOfUser.js";
import getEnv from "./utils/getEnv.js";

class WSServer {
  #io = new Server();

  constructor() {}

  start(httpServer) {
    this.#io = new Server(httpServer, {
      cors: { origin: [getEnv("WS_ALLOWED_ORIGIN")] },
      path: "/direct",
    });

    this.#io.engine.use(passport.authenticate("jwt", { session: false }));
    this.#io.engine.use(async (req, res, next) => {
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

    this.#io.on("connection", (socket) => {
      console.log("new WS connection");

      socket.auth = { profileId: socket.request.profile.id };

      socket.on("chat msg", (msg, contactId, recieverId) => {
        this.#handleMessage(socket, msg, contactId, recieverId);
      });
    });
  }

  async #handleMessage(socket, msg, chatId, receiverId) {
    const [result, msgErr] = await asyncHandler.prismaQuery(() =>
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

    const targetSocket = await this.#getSocketFromProfileId(receiverId);

    if (msgErr || !targetSocket) {
      return;
    }

    this.#io.to([targetSocket.id, socket.id]).emit("chat msg", result);
  }

  async #getSocketFromProfileId(profileId) {
    const allSockets = await this.#io.fetchSockets();

    for (let i = 0; i < allSockets.length; i++) {
      if (allSockets[i].auth.profileId === profileId) {
        return allSockets[i];
      }
    }
  }
}

const wsServer = new WSServer();
export default wsServer;
