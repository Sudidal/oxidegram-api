function refuseNotAuthed(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
}

export { refuseNotAuthed };