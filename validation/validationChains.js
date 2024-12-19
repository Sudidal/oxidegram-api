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
  ];

  profileValidationChain = (update) => [
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
      .matches(/^[a-zA-Z0-9_][a-zA-Z0-9_.]/)
      .withMessage("Username must only contain (a-z) (A-Z) (_) (.)")
      .custom(async (value, { req }) => {
        if (update) return true;
        await customValidators.isUsernameNotUsed();
      })
      .withMessage("Username already in use"),

    body("fullName")
      .isString()
      .trim()
      .isLength({
        min: 1,
        max: validationVars.fullname_max,
      })
      .withMessage(
        `Full name should be between 1 and ${validationVars.fullname_max} characters`
      ),

    // Not required
    body("bio")
      .optional({ values: "falsy" })
      .isLength({ min: 0, max: validationVars.bio_max })
      .withMessage(
        `Bio should not exceed ${validationVars.bio_max} characters`
      ),
    body("websiteUrl")
      .optional({ values: "falsy" })
      .isURL()
      .trim()
      .withMessage(`Website should be a valid URL`),
    body("gender")
      .optional({ values: "falsy" })
      .isString()
      .matches(/^(MALE|FEMALE)$/)
      .withMessage("Gender should be a MALE or FEMALE"),
    body("country").optional({ values: "falsy" }).isString().trim(),
    body("file.mimetype")
      .optional({ values: "falsy" })
      .matches(/^image\/*/)
      .withMessage("Avatar File type should be an image"),
    body("file.size")
      .optional({ values: "falsy" })
      .isNumeric()
      .custom((field) => {
        return field < 6 * 1000 * 1000; // 6MB
      })
      .withMessage("Avatar file size should be less than 6MB"),
  ];

  postValidationChain = () => [
    body("content")
      .isString()
      .trim()
      .withMessage("Post content must be a string"),
    body("file.mimetype")
      .matches(/^(image|video)\/*/)
      .withMessage("File type should be an image or a video"),
    body("file.size")
      .isNumeric()
      .custom((field) => {
        return field < 50 * 1000 * 1000; // 50MB
      })
      .withMessage("File size should be less than 50MB"),
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
