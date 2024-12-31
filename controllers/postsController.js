import { requiresAccount } from "../middleware/authentication.js";
import validationChains from "../validation/validationChains.js";
import validateInput from "../middleware/validateInput.js";
import database from "../storage/database.js";
import multer from "multer";
import remoteStorage from "../storage/remoteStorage.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class PostsController {
  constructor() {}

  async getMany(req, res, next) {
    const queryOptions = {
      limit: parseInt(req.query.limit),
      offset: parseInt(req.query.offset),
      sortByLikes: req.query.sortByLikes,
      filter: req.query.filter,
      order: "desc",
    };

    const [result, err] = await database.getPosts(req.profile.id, queryOptions);

    if (err) {
      return next(err);
    }

    res.json({ posts: result });
  }

  async getOne(req, res, next) {
    const queryOptions = {
      postId: parseInt(req.params.postId),
      singleValue: true,
    };

    const [result, err] = await database.getPosts(req.profile.id, queryOptions);

    if (err) {
      return next(err);
    }

    res.json({ post: result });
  }

  post = [
    requiresAccount,
    upload.single("file"),
    (req, res, next) => {
      req.body.file = req.file;
      next();
    },
    validateInput(validationChains.postValidationChain()),
    async (req, res, next) => {
      const uploadRes = await remoteStorage.uploadPostFile(req.body.file);
      if (uploadRes instanceof Error) {
        return next(uploadRes);
      }
      console.log(uploadRes);

      const fileType = req.body.file?.mimetype.split("/");
      const queryOptions = {
        content: req.validatedData.content,
        publishDate: new Date().toISOString(),
        authorId: req.profile.id,
        fileUrl: uploadRes,
        fileType: fileType[0] === "video" ? "VIDEO" : "IMAGE",
      };

      const [newPost, newPostErr] = await database.createPost(
        req.profile.id,
        queryOptions
      );

      if (newPostErr) {
        return next(newPostErr);
      }

      const [newNotif, newNotifErr] = await database.createNotification({
        type: "POST",
        title: JSON.stringify({
          postId: newPost.id,
          authorId: newPost.authorId,
        }),
      });

      if (newNotifErr) {
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
    async (req, res, next) => {
      const [result, err] = await database.getPosts(req.profile.id, {
        postId: parseInt(req.params.postId),
      });

      if (result?.authorId !== req.profile.id) {
        return res
          .status(403)
          .json({ message: "You are not allowed to do this action" });
      }

      const [deleteResult, deleteErr] = await database.deletePost(
        parseInt(req.params.postId),
        {}
      );

      if (deleteErr) {
        return next(err);
      }

      res.json({ message: "Post deleted successfully" });
    },
  ];

  like = [
    requiresAccount,
    async function (req, res, next) {
      const queryOptions = {
        likerId: req.profile.id,
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
    async function (req, res, next) {
      const queryOptions = {
        unlikerId: req.profile.id,
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
