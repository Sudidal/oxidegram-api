import passport from "passport";
import getProfileOfUser from "./getProfileOfUser.js";

const requiresAccount = passport.authenticate("jwt", { session: false });
const requiresProfile = [
  requiresAccount,
  async (req, res, next) => {
    getProfileOfUser(req.user.id);

    req.profile = profile;

    if (!profile) {
      return res
        .status(403)
        .json({ message: "No profile associated with this account" });
    }
    next();
  },
];
export { requiresAccount, requiresProfile };
