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

    // body("confirmPassword")
    //   .isString()
    //   .notEmpty()
    //   .custom(customValidators.isPasswordsMatch)
    //   .withMessage("Passwords do not match"),

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
      .custom(customValidators.isUsernameNotUsed)
      .withMessage("Username already in use"),

    body("fullName")
      .isString()
      .trim()
      .isLength({
        min: 1,
        max: validationVars.fullname_max,
      })
      .withMessage(
        `Full name should be between 1 and ${validationVars.lastname_max} characters`
      ),

    //  THESE FIELDS ARE NOT IN THE INITIAL REGISTERATION
    //  KEPT HERE FOR FUTURE USE

    // body("avatar.mimetype")
    //   .matches(/^image\/*/)
    //   .withMessage("Avatar File type should be an image"),
    // body("avatar.size")
    //   .isNumeric()
    //   .custom((field) => {
    //     return field < 6 * 1000 * 1000; // 6MB
    //   })
    //   .withMessage("Avatar file size should be less than 6MB"),
    // body("bio")
    //   .isLength({ min: 0, max: validationVars.bio_max })
    //   .withMessage(
    //     `Bio should not exceed ${validationVars.bio_max} characters`
    //   ),
    // body("gender")
    //   .isString()
    //   .matches(/^(MALE|FEMALE)$/)
    //   .withMessage("Gender should be a MALE or FEMALE"),
    // body("country").isString().trim().notEmpty(),
  ];

  postValidationChain = () => [
    body("content")
      .isString()
      .trim()
      .withMessage("Post content must be a string"),
    body("file.mimetype")
      .matches(/^[image|video]\/*/)
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
