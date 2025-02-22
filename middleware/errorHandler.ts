import type { Request, Response } from "express";

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: (err: Error) => void
) {
  console.error(err.stack);
  res.sendStatus(500);
  return;
}

export default errorHandler;
