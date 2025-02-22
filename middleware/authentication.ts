import type { Request, Response } from "express";

function requiresAccount(req: Request, res: Response, next) {
  if (req.body.profile.id === null || req.body.profile.id === undefined) {
    return res.sendStatus(401);
  }
  next();
}

export { requiresAccount };
