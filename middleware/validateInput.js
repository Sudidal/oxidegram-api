import { validationResult, matchedData } from "express-validator";

function validateInput(validationChain) {
  return [
    validationChain,
    function (req, res, next) {
      const validationErrs = validationResult(req);
      req.validatedData = matchedData(req);
      if (!validationErrs.isEmpty()) {
        return res.status(400).json({ errors: validationErrs.array() });
      } else {
        next();
      }
    },
  ];
}

export default validateInput;
