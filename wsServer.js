import prisma from "./utils/prisma.js";
import asyncHandler from "./utils/asyncHandler.js";
import { Server } from "socket.io";
import passport from "passport";
import getProfileOfUser from "./middleware/getProfileOfUser.js";
import getEnv from "./utils/getEnv.js";
import { instrument } from "@socket.io/admin-ui";

class WSServer {
  #io = new Server();
  #adminIo = new Server();

  constructor() {}

  start(httpServer) {
    this.#io = new Server(httpServer, {
      cors: {
        origin: [getEnv("WS_ALLOWED_ORIGIN"), "https://admin.socket.io"],
        credentials: true,
      },
      path: "/direct",
    });
    this.#adminIo = new Server(httpServer, {
      cors: {
        origin: [getEnv("WS_ALLOWED_ORIGIN"), "https://admin.socket.io"],
        credentials: true,
      },
    });

    this.#io.use(this.onlyWhenHandshakeSocket(this.authenticate));

    this.#io.on("connection", (socket) => {
      console.log("new WS connection");

      socket.on("chat msg", (msg, contactId, recieverId) => {
        this.#handleMessage(socket, msg, contactId, recieverId);
      });
    });

    instrument(this.#adminIo, {
      auth: {
        type: "basic",
        username: getEnv("WS_ADMIN_USERNAME"),
        password: getEnv("WS_ADMIN_PASSWORD"),
      },
    });
  }

  async #handleMessage(socket, msg, chatId, receiverId) {
    const [result, msgErr] = await asyncHandler.prismaQuery(() =>
      prisma.message.create({
        data: {
          content: msg,
          sendDate: new Date().toISOString(),
          sender: {
            connect: { id: socket.auth.profileId },
          },
          chat: {
            connect: { id: chatId },
          },
        },
      })
    );

    if (msgErr) {
      return;
    }

    const targetSocket = await this.#getSocketFromProfileId(receiverId);

    this.#io.to([targetSocket?.id, socket.id]).emit("chat msg", result);
  }

  async #getSocketFromProfileId(profileId) {
    const allSockets = await this.#io.fetchSockets();

    for (let i = 0; i < allSockets.length; i++) {
      if (allSockets[i].auth.profileId === profileId) {
        return allSockets[i];
      }
    }
  }

  async authenticate(socket, next) {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err, user, info, status) => {
        if (!user || err) {
          return next(new Error("no user"));
        }

        const profile = await getProfileOfUser(user.id);

        if (!profile) {
          return next(new Error("no profile"));
        }
        socket.auth = { profileId: profile.id };
        next();
      }
    )(socket.request);
  }

  onlyWhenHandshakeSocket(middleware) {
    return async (socket, next) => {
      const handshake = socket.request._query.sid === undefined;
      if (handshake) {
        return await middleware(socket, next);
      } else {
        next();
      }
    };
  }
}

const wsServer = new WSServer();
export default wsServer;
