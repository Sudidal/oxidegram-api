function requiresAccount(req, res, next) {
  if (req.profile.id === null || req.profile.id === undefined) {
    return res.sendStatus(401);
  }
  next();
}

export { requiresAccount };
