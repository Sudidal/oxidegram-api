const requiresAccount = (req, res, next) => {
  if (!req.user) {
    res.sendStatus(401);
  }
  next();
};
const requiresProfile = [
  requiresAccount,
  (req, res, next) => {
    if (!req.profile) {
      return res
        .status(403)
        .json({ message: "No profile associated with this account" });
    }
    next();
  },
];
export { requiresAccount, requiresProfile };
