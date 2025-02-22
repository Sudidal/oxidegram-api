import type { Request, Response, NextFunction } from "express";

function requiresAccount(req: Request, res: Response, next: NextFunction) {
  if (req.body.profile.id === null || req.body.profile.id === undefined) {
    res.sendStatus(401);
    return;
  }
  next();
}

export { requiresAccount };
