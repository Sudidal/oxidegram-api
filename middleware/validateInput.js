import { validationResult, matchedData } from "express-validator";

function validateInput(validationChain) {
  return [
    validationChain,
    function (req, res, next) {
      const validationErrs = validationResult(req);
      if (!validationErrs.isEmpty()) {
        return res.json({ errors: validationErrs.array() });
      }
      req.body.validatedData = matchedData(req);
      next();
    },
  ];
}

export default validateInput;
