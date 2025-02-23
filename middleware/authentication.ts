import type { Request, Response, NextFunction } from "express";

function requiresAccount(req: Request, res: Response, next: NextFunction) {
  if (res.locals.profile.id === null || res.locals.profile.id === undefined) {
    res.sendStatus(401);
    return;
  }
  next();
}

export { requiresAccount };
