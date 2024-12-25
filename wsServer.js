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

    this.#io.engine.use(
      this.onlyWhenHandshake(passport.authenticate("jwt", { session: false }))
    );
    this.#io.engine.use(
      this.onlyWhenHandshake(async (req, res, next) => {
        if (!req.user) {
          res.writeHead(401);
          return res.end();
        }

        const profile = await getProfileOfUser(req.user.id);

        if (!profile) {
          res.writeHead(403, { "content-type": "application/json" });
          return res.write(
            JSON.stringify({
              message: "No profile associated with this account",
            })
          );
        } else {
          req.profile = profile;
          next();
        }
      })
    );

    this.#io.on("connection", (socket) => {
      console.log("new WS connection");

      socket.auth = { profileId: socket.request.profile.id };

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
            connect: { id: socket.request.profile.id },
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

  onlyWhenHandshake(middleware) {
    return async (req, res, next) => {
      const handshake = req._query.sid === undefined;
      if (handshake) {
        return await middleware(req, res, next);
      } else {
        next();
      }
    };
  }
}

const wsServer = new WSServer();
export default wsServer;
