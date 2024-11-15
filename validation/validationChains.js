import { body } from "express-validator";
import customValidators from "./customValidators.js";
import validationVars from "./validationVars.js";

class ValidationChains {
  constructor() {}

  registerValidationChain = () => [
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
    body("confirmPassword")
      .isString()
      .notEmpty()
      .custom(customValidators.isPasswordsMatch)
      .withMessage("Passwords do not match"),
  ];

  profileValidationChain = () => [
    body("username")
      .isString()
      .trim()
      .isLength({
        min: 1,
        max: validationVars.username_max,
      })
      .withMessage(
        `Username must be between 1 and ${validationVars.username_max} characters`
      )
      .bail()
      .custom(customValidators.isUsernameNotUsed)
      .withMessage("Username already in use"),
    body("firstName")
      .isString()
      .trim()
      .isLength({
        min: 1,
        max: validationVars.lastname_max,
      })
      .withMessage(
        `First name should be between 1 and ${validationVars.firstname_max} characters`
      ),
    body("lastName")
      .isString()
      .trim()
      .isLength({
        min: 1,
        max: validationVars.lastname_max,
      })
      .withMessage(
        `Last name should be between 1 and ${validationVars.lastname_max} characters`
      ),
    body("bio")
      .isLength({ min: 0, max: validationVars.bio_max })
      .withMessage(
        `Bio should not exceed ${validationVars.bio_max} characters`
      ),
    body("gender")
      .isString()
      .matches(/^(MALE|FEMALE)$/)
      .withMessage("Gender should be a MALE or FEMALE"),
    body("country").isString().trim().notEmpty(),
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
