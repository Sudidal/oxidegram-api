import { Request, Response, NextFunction } from "express";

import { requiresAccount } from "../middleware/authentication.ts";
import validationChains from "../validation/validationChains.ts";
import validateInput from "../middleware/validateInput.ts";
import database from "../storage/database.ts";
import multer from "multer";
import remoteStorage from "../storage/remoteStorage.ts";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class PostsController {
  constructor() {}

  async getMany(req: Request, res: Response, next: NextFunction) {
    let filter: "images" | "videos" | undefined = undefined;
    if (req.query.filter === "images" || req.query.filter === "videos") {
      filter = req.query.filter;
    }

    const queryOptions = {
      limit: parseInt((req.query.limit as string) || ""),
      offset: parseInt((req.query.offset as string) || ""),
      sortByLikes: Boolean(req.query.sortByLikes || false),
      filter: filter,
      order: "desc" as "asc" | "desc",
    };

    const [result, err] = await database.getPosts(
      queryOptions,
      res.locals.profile.id
    );

    if (err) {
      return next(err);
    }

    res.json({ posts: result });
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const queryOptions = {
      postId: parseInt(req.params.postId),
      singleValue: true,
    };

    const [result, err] = await database.getPosts(
      queryOptions,
      res.locals.profile.id
    );

    if (err) {
      return next(err);
    }

    res.json({ post: result });
  }

  post = [
    requiresAccount,
    upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
      req.body.file = req.file;
      next();
    },
    ...validateInput(validationChains.postValidationChain()),
    async (req: Request, res: Response, next: NextFunction) => {
      const uploadRes = await remoteStorage.uploadPostFile(req.body.file);
      if (uploadRes instanceof Error || !uploadRes) {
        return next(uploadRes);
      }
      console.log(uploadRes);

      const fileType = req.body.file?.mimetype.split("/");
      const queryOptions = {
        content: req.body.validatedData.content,
        publishDate: new Date(),
        authorId: res.locals.profile.id,
        fileUrl: uploadRes,
        fileType:
          fileType[0] === "video" ? "VIDEO" : ("IMAGE" as "VIDEO" | "IMAGE"),
      };

      const [newPost, newPostErr] = await database.createPost(queryOptions);

      if (newPostErr || !newPost) {
        return next(newPostErr);
      }

      const [newNotif, newNotifErr] = await database.createNotification({
        type: "POST",
        title: JSON.stringify({
          postId: newPost.id,
          authorId: newPost.authorId,
        }),
      });

      if (newNotifErr || !newNotif) {
        console.error(newNotifErr);
      } else {
        const [pushNotifResult, pushNotifErr] =
          await database.pushNotificationToFollowers(
            newPost.authorId,
            newNotif.id
          );

        if (pushNotifErr) {
          console.error(pushNotifErr);
        }
      }

      res.json({ message: "Created post successfully" });
    },
  ];

  delete = [
    requiresAccount,
    async (req: Request, res: Response, next: NextFunction) => {
      const [result, err] = await database.getPosts(
        {
          postId: parseInt(req.params.postId),
          singleValue: true,
        },
        res.locals.profile.id
      );

      if (!result || err) {
        return next(err);
      }
      if (Array.isArray(result)) {
        return next("database.getPosts() as singleValue returned an array");
      }

      if (result.authorId !== res.locals.profile.id) {
        return res
          .status(403)
          .json({ message: "You are not allowed to do this action" });
      }

      const [deleteResult, deleteErr] = await database.deletePost(
        parseInt(req.params.postId)
      );

      if (deleteErr) {
        return next(err);
      }

      res.json({ message: "Post deleted successfully" });
    },
  ];

  like = [
    requiresAccount,
    async function (req: Request, res: Response, next: NextFunction) {
      const queryOptions = {
        likerId: res.locals.profile.id,
      };
      const [result, err] = await database.updatePost(
        parseInt(req.params.postId),
        queryOptions
      );

      if (err) {
        return next(err);
      }
      res.json({ message: "liked Post successfully" });
    },
  ];
  unlike = [
    requiresAccount,
    async function (req: Request, res: Response, next: NextFunction) {
      const queryOptions = {
        unlikerId: res.locals.profile.id,
      };
      const [result, err] = await database.updatePost(
        parseInt(req.params.postId),
        queryOptions
      );

      if (err) {
        return next(err);
      }
      res.json({ message: "Unliked Post successfully" });
    },
  ];
}

const postsController = new PostsController();
export default postsController;
