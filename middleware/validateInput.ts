import type { Request, Response } from "express";

import { validationResult, matchedData } from "express-validator";

function validateInput(validationChain: Function[]) {
  return [
    validationChain,
    function (req: Request, res: Response, next: (err?: Error) => void) {
      const validationErrs = validationResult(req);
      req.body.validatedData = matchedData(req);
      if (!validationErrs.isEmpty()) {
        return res.status(400).json({ errors: validationErrs.array() });
      } else {
        next();
      }
    },
  ];
}

export default validateInput;
