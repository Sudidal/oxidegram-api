import type { Request, Response, NextFunction, RequestHandler } from "express";

import { validationResult, matchedData } from "express-validator";

function validateInput (validationChain: RequestHandler[]) {
  return [
    ...validationChain,
    (req: Request, res: Response, next: NextFunction) => {
      const validationErrs = validationResult(req);
      req.body.validatedData = matchedData(req);
      if (!validationErrs.isEmpty()) {
        res.status(400).json({ errors: validationErrs.array() });
        return
      } else {
        next();
      }
    },
  ];
};

export default validateInput;
