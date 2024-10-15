import { body } from "express-validator";
import customValidators from "./customValidators.js";
import validationVars from "./validationVars.js";

class ValidationChains {
  constructor() {}

  registerValidationChain = () => [
    body("username")
      .isString()
      .trim()
      .isLength({
        min: validationVars.username_min,
        max: validationVars.username_max,
      })
      .withMessage(
        `Username must be between ${validationVars.username_min} and ${validationVars.username_max} characters`
      )
      .bail()
      .custom(customValidators.isUsernameNotUsed)
      .withMessage("Username already in use"),
    body("email")
      .isEmail()
      .trim()
      .withMessage("Please enter a valid E-mail address")
      .bail()
      .custom(customValidators.isEmailNotUsed)
      .withMessage("E-mail already in use"),
    body("password")
      .isString()
      .notEmpty()
      .withMessage("Please enter a password"),
    body("confirm_password")
      .isString()
      .notEmpty()
      .custom(customValidators.isPasswordsMatch)
      .withMessage("Passwords do not match"),
  ];

  postValidationChain = () => [
    body("content")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Post content can not be empty"),
  ];
  commentValidationChain = () => [
    body("content")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Comment can not be empty"),
  ];
}

const validationChains = new ValidationChains();
export default validationChains;
