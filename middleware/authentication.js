import passport from "passport";
import getProfileOfUser from "./getProfileOfUser.js";

const requiresAccount = passport.authenticate("jwt", { session: false });
const requiresProfile = [
  requiresAccount,
  async (req, res, next) => {
    const profile = await getProfileOfUser(req.user.id);

    if (!profile) {
      return res
        .status(403)
        .json({ message: "No profile associated with this account" });
    }
    req.profile = profile;
    next();
  },
];
export { requiresAccount, requiresProfile };
