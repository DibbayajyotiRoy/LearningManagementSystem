import { body, param, query, validationResult } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    //run all validation
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next();
    }

    const extractedError = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    throw new Error("Validation Error");
  };
};

export const commonValidations = {
  pagination: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be an integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  email: body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  name: body("name").trim().isLength({ min: 3, max: 50 }),
};

export const validateSignUp = validate([
  commonValidations.email,
  commonValidations.name,
]);
