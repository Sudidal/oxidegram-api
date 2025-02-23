import { Request, Response, NextFunction } from "express";

import { requiresAccount } from "../middleware/authentication";
import validateInput from "../middleware/validateInput";
import validationChains from "../validation/validationChains";
import multer from "multer";
import remoteStorage from "../storage/remoteStorage";
import database from "../storage/database";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class ProfilesController {
  constructor() {}

  async getMany(req: Request, res: Response, next: NextFunction) {
    const queryOptions = {
      take: parseInt((req.query.limit as string) || ""),
      skip: parseInt((req.query.skip as string) || ""),
      sortByFollowers: Boolean(req.query.sortByFollowers) || undefined,
      order: "desc" as "desc" | "asc",
    };

    const [result, err] = await database.getProfiles(
      res.locals.profile.id,
      queryOptions
    );

    if (err) {
      return next(err);
    }

    res.json({ profiles: result });
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const profileId = parseInt(req.params.profileId);

    const queryOptions = {
      profileId: profileId,
      singleValue: true,
    };

    const [result, err] = await database.getProfiles(
      res.locals.profile.id,
      queryOptions
    );

    if (err) {
      return next(err);
    }

    res.json({ profile: result });
  }

  getMe = [
    requiresAccount,
    async (req: Request, res: Response, next: NextFunction) => {
      const queryOptions = {
        profileId: res.locals.profile.id,
        singleValue: true,
      };

      const [result, err] = await database.getProfiles(
        res.locals.profile.id,
        queryOptions
      );

      if (err) {
        return next(err);
      }

      res.json({ profile: result });
    },
  ];

  async search(req: Request, res: Response, next: NextFunction) {
    const queryOptions = {
      take: parseInt(req.query.take as string | ""),
      skip: parseInt(req.query.skip as string | ""),
      searchQuery: req.query.searchQuery as string | undefined,
    };

    const [result, err] = await database.getProfiles(
      res.locals.profile.id,
      queryOptions
    );

    if (err) {
      return next(err);
    }

    res.json({ profiles: result });
  }

  async getDetailsOfOne(req: Request, res: Response, next: NextFunction) {
    const profileId = parseInt(req.params.profileId);

    if (isNaN(profileId)) {
      res.sendStatus(400);
      return;
    }

    let allowSensitive = false;
    if (res.locals.profile.id === profileId) {
      allowSensitive = true;
    }

    const queryOptions = {
      follows: Boolean(req.query.follows),
      followers: Boolean(req.query.followers),
      posts: Boolean(req.query.posts),
      savedPosts: allowSensitive ? Boolean(req.query.savedPosts) : false,
      contacts: allowSensitive ? Boolean(req.query.contacts) : false,
      notifications: allowSensitive ? Boolean(req.query.notifications) : false,
    };

    const [result, err] = await database.getDetailsOfProfile(
      res.locals.profile.id,
      profileId,
      queryOptions
    );

    if (err) {
      return next(err);
    }

    res.json({ profile: result });
  }

  put = [
    requiresAccount,
    upload.single("avatar"),
    (req: Request, res: Response, next: NextFunction) => {
      req.body.file = req.file;
      next();
    },
    ...validateInput(validationChains.profileValidationChain(true)),
    async (req: Request, res: Response, next: NextFunction) => {
      let uploadRes: string | Error | undefined = undefined;
      if (req.body.file) {
        uploadRes = await remoteStorage.uploadPostFile(req.body.file);
      }
      console.log(uploadRes);
      if (uploadRes instanceof Error) {
        return next(uploadRes);
      }

      const queryOptions = {
        username: req.body.validatedData.username,
        fullName: req.body.validatedData.fullName,
        bio: req.body.validatedData.bio ?? "",
        country: req.body.validatedData.country ?? "",
        gender: req.body.validatedData.gender,
        websiteUrl: req.body.validatedData.websiteUrl ?? "",
        avatarUrl: uploadRes,
      };

      const [result, err] = await database.updateProfile(
        res.locals.profile.id,
        queryOptions
      );

      if (err) {
        return next(err);
      }

      res.json({ message: "Profile updated successfully" });
    },
  ];

  follow = [
    requiresAccount,
    async (req: Request, res: Response, next: NextFunction) => {
      const queryOptions = {
        followId: parseInt(req.params.profileId),
      };

      const [result, err] = await database.updateProfile(
        res.locals.profile.id,
        queryOptions
      );

      if (err) {
        return next(err);
      }

      res.json({ message: "Followed profile successfully" });
    },
  ];
  unfollow = [
    requiresAccount,
    async (req: Request, res: Response, next: NextFunction) => {
      const queryOptions = {
        unfollowId: parseInt(req.params.profileId),
      };

      const [result, err] = await database.updateProfile(
        res.locals.profile.id,
        queryOptions
      );

      if (err) {
        return next(err);
      }

      res.json({ message: "Unfollowed profile successfully" });
    },
  ];

  savePost = [
    requiresAccount,
    async (req: Request, res: Response, next: NextFunction) => {
      console.log("got it");
      const queryOptions = {
        savePostId: parseInt(req.params.postId),
      };

      const [result, err] = await database.updateProfile(
        res.locals.profile.id,
        queryOptions
      );

      if (err) {
        return next(err);
      }

      res.json({ message: "Saved post successfully" });
    },
  ];
  unsavePost = [
    requiresAccount,
    async (req: Request, res: Response, next: NextFunction) => {
      const queryOptions = {
        unsavePostId: parseInt(req.params.postId),
      };

      const [result, err] = await database.updateProfile(
        res.locals.profile.id,
        queryOptions
      );

      if (err) {
        return next(err);
      }

      res.json({ message: "Unsaved post successfully" });
    },
  ];
}

const profilesController = new ProfilesController();
export default profilesController;
