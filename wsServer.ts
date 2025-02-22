import prisma from "./utils/prisma.js";
import asyncHandler from "./utils/asyncHandler.js";
import { Server as SocketIoServer } from "socket.io";
import passport from "passport";
import getProfileOfUser from "./middleware/getProfileOfUser.js";
import { instrument } from "@socket.io/admin-ui";
import process from "process";

import type { Server } from "http";
import type { Socket } from "socket.io";
import type { User, PrismaPromise } from "@prisma/client";

class WSServer {
  #io: SocketIoServer;
  #adminIo: SocketIoServer;

  constructor() {}

  start(httpServer: Server) {
    this.#io = new SocketIoServer(httpServer, {
      cors: {
        origin: [process.env.WS_ALLOWED_ORIGIN, "https://admin.socket.io"],
        credentials: true,
      },
      path: "/direct",
    });
    this.#adminIo = new SocketIoServer(httpServer, {
      cors: {
        origin: [process.env.WS_ALLOWED_ORIGIN, "https://admin.socket.io"],
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
        username: process.env.WS_ADMIN_USERNAME,
        password: process.env.WS_ADMIN_PASSWORD,
      },
    });
  }

  process;

  async #handleMessage(socket: Socket, msg: string, chatId: number, receiverId: number) {
    const [result, msgErr] = await asyncHandler.prismaQuery(() =>
      prisma.message.create({
        data: {
          content: msg,
          sendDate: new Date().toISOString(),
          sender: {
            connect: { id: socket.data.auth.profileId },
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

    if (targetSocket) {
      this.#io.to([targetSocket.id, socket.id]).emit("chat msg", result);
    }
  }

  async #getSocketFromProfileId(profileId: number) {
    const allSockets = await this.#io.fetchSockets();

    for (let i = 0; i < allSockets.length; i++) {
      if (allSockets[i].data.auth.profileId === profileId) {
        return allSockets[i];
      }
    }
  }

  async authenticate(socket: Socket, next: (error?: Error) => void) {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err: Error, user: User) => {
        if (!user || err) {
          return next(new Error("no user"));
        }

        const profile = await getProfileOfUser(user.id);

        if (!profile) {
          return next(new Error("no profile"));
        }
        socket.data.auth = { profileId: profile.id };
        next();
      }
    )(socket.request);
  }

  onlyWhenHandshakeSocket(
    middleware: (socket: Socket, next: () => void) => void
  ) {
    return async (socket: Socket, next: () => void) => {
      const handshake = socket.request["_query"].sid === undefined;
      if (handshake) {
        return middleware(socket, next);
      } else {
        next();
      }
    };
  }
}

const wsServer = new WSServer();
export default wsServer;
