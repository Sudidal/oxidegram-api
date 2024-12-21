import { requiresProfile } from "../middleware/authentication.js";
import validateInput from "../middleware/validateInput.js";
import validationChains from "../validation/validationChains.js";
import multer from "multer";
import remoteStorage from "../storage/remoteStorage.js";
import database from "../storage/database.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class ProfilesController {
  constructor() {}

  async getMany(req, res, next) {
    const queryOptions = {
      take: parseInt(req.query.limit),
      skip: parseInt(req.query.skip),
      sortByFollowers: req.query.sortByFollowers,
      order: "desc",
    };

    const [result, err] = await database.getProfiles(
      req.profile.id,
      queryOptions
    );

    if (err) {
      return next(err);
    }

    res.json({ profiles: result });
  }

  async getOne(req, res, next) {
    const queryOptions = {
      profileId: parseInt(req.params.profileId),
      singleValue: true,
    };

    const [result, err] = await database.getProfiles(
      req.profile.id,
      queryOptions
    );

    if (err) {
      return next(err);
    }

    res.json({ profile: result });
  }

  getMe = [
    requiresProfile,
    async (req, res, next) => {
      const queryOptions = {
        profileId: req.profile.id,
        singleValue: true,
      };

      const [result, err] = await database.getProfiles(
        req.profile.id,
        queryOptions
      );

      if (err) {
        return next(err);
      }

      res.json({ profile: result });
    },
  ];

  async search(req, res, next) {
    console.log(req.query.searchQuery);
    const queryOptions = {
      take: parseInt(req.query.take),
      skip: parseInt(req.query.skip),
      searchQuery: req.query.searchQuery,
    };

    const [result, err] = await database.getProfiles(
      req.profile.id,
      queryOptions
    );

    if (err) {
      return next(err);
    }

    res.json({ profiles: result });
  }

  async getDetailsOfOne(req, res, next) {
    const queryOptions = {
      follows: Boolean(req.query.follows),
      followers: Boolean(req.query.followers),
      posts: Boolean(req.query.posts),
      savedPosts: Boolean(req.query.savedPosts),
      contacts: Boolean(req.query.contacts),
    };

    const [result, err] = await database.getDetailsOfProfile(
      req.profile.id,
      parseInt(req.params.profileId),
      queryOptions
    );

    if (err) {
      return next(err);
    }

    res.json({ profile: result });
  }

  put = [
    requiresProfile,
    upload.single("avatar"),
    (req, res, next) => {
      req.body.file = req.file;
      next();
    },
    validateInput(validationChains.profileValidationChain(true)),
    async (req, res, next) => {
      let uploadRes = null;
      if (req.body.file) {
        uploadRes = await remoteStorage.uploadPostFile(req.body.file);
      }
      console.log(uploadRes);
      if (uploadRes instanceof Error) {
        return next(uploadRes);
      }

      const queryOptions = {
        username: req.validatedData.username,
        fullName: req.validatedData.fullName,
        bio: req.validatedData.bio ?? "",
        country: req.validatedData.country ?? "",
        gender: req.validatedData.gender,
        websiteUrl: req.validatedData.websiteUrl ?? "",
        avatarUrl: uploadRes,
      };

      const [result, err] = await database.updateProfile(
        req.profile.id,
        queryOptions
      );

      if (err) {
        return next(err);
      }

      res.json({ message: "Profile updated successfully" });
    },
  ];

  follow = [
    requiresProfile,
    async (req, res, next) => {
      const queryOptions = {
        followId: parseInt(req.params.profileId),
      };

      const [result, err] = await database.updateProfile(
        req.profile.id,
        queryOptions
      );

      if (err) {
        return next(err);
      }

      res.json({ message: "Followed profile successfully" });
    },
  ];
  unfollow = [
    requiresProfile,
    async (req, res, next) => {
      const queryOptions = {
        unfollowId: parseInt(req.params.profileId),
      };

      const [result, err] = await database.updateProfile(
        req.profile.id,
        queryOptions
      );

      if (err) {
        return next(err);
      }

      res.json({ message: "Unfollowed profile successfully" });
    },
  ];

  savePost = [
    requiresProfile,
    async (req, res, next) => {
      console.log("got it");
      const queryOptions = {
        savePostId: parseInt(req.params.postId),
      };

      const [result, err] = await database.updateProfile(
        req.profile.id,
        queryOptions
      );

      if (err) {
        return next(err);
      }

      res.json({ message: "Saved post successfully" });
    },
  ];
  unsavePost = [
    requiresProfile,
    async (req, res, next) => {
      const queryOptions = {
        unsavePostId: parseInt(req.params.postId),
      };

      const [result, err] = await database.updateProfile(
        req.profile.id,
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
